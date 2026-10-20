import { describe, expect, it } from 'vitest';
import { CatalogProductViewModel } from '../models/catalog.models';
import {
  applyFilters,
  EMPTY_FILTERS,
  filtersFromParams,
  filtersToParams,
  parsePrice,
} from './catalogFilters';

const p = (id: string, brand: string, price: string, inStock?: boolean) =>
  ({ id, name: id, brand, price, inStock }) as CatalogProductViewModel;
const items = [
  p('b', 'X', 'US$ 20 info'),
  p('a', 'Y', 'US$ 100 info', false),
  p('c', 'X', 'US$ 5'),
];

describe('catalogFilters', () => {
  it('parses prices', () => {
    expect(parsePrice('US$ 129 info')).toBe(129);
    expect(parsePrice('sob consulta')).toBeNull();
  });

  it('round-trips through URL params', () => {
    const filters = {
      ...EMPTY_FILTERS,
      brand: 'X',
      minPrice: 5,
      inStockOnly: true,
      sort: 'name' as const,
    };
    const params = new URLSearchParams();
    filtersToParams(params, filters);
    expect(params.toString()).toBe('brand=X&min=5&stock=1&sort=name');
    expect(filtersFromParams(params)).toEqual(filters);
    expect(filtersFromParams(new URLSearchParams('sort=bogus&min=abc')).sort).toBe('relevance');
  });

  it('filters and sorts', () => {
    const ids = (f: Partial<typeof EMPTY_FILTERS>) =>
      applyFilters(items, { ...EMPTY_FILTERS, ...f }).map((i) => i.id);
    expect(ids({ brand: 'X' })).toEqual(['b', 'c']);
    expect(ids({ inStockOnly: true })).toEqual(['b', 'c']);
    expect(ids({ minPrice: 10, maxPrice: 50 })).toEqual(['b']);
    expect(ids({ sort: 'price-asc' })).toEqual(['c', 'b', 'a']);
    expect(ids({ sort: 'price-desc' })).toEqual(['a', 'b', 'c']);
    expect(ids({ sort: 'name' })).toEqual(['a', 'b', 'c']);
  });
});
