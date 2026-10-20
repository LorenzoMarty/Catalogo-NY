import { CatalogProductViewModel } from '../models/catalog.models';

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'name', label: 'Nome (A-Z)' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export interface CatalogFilters {
  readonly brand: string;
  readonly minPrice: number | null;
  readonly maxPrice: number | null;
  readonly inStockOnly: boolean;
  readonly sort: SortValue;
}

export const EMPTY_FILTERS: CatalogFilters = {
  brand: '',
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  sort: 'relevance',
};

/** "US$ 129 info" -> 129; NaN-safe (unknown prices sort last and fail price bounds). */
export function parsePrice(price: string): number | null {
  const match = price.replace(/,/g, '.').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export function filtersFromParams(params: URLSearchParams): CatalogFilters {
  const num = (key: string): number | null => {
    const raw = params.get(key);
    const value = raw === null || raw.trim() === '' ? NaN : Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  };
  const sort = params.get('sort');

  return {
    brand: params.get('brand') ?? '',
    minPrice: num('min'),
    maxPrice: num('max'),
    inStockOnly: params.get('stock') === '1',
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? (sort as SortValue) : 'relevance',
  };
}

/** Writes only non-default values so the URL stays short. */
export function filtersToParams(params: URLSearchParams, filters: CatalogFilters): void {
  const set = (key: string, value: string | null) =>
    value ? params.set(key, value) : params.delete(key);

  set('brand', filters.brand || null);
  set('min', filters.minPrice === null ? null : String(filters.minPrice));
  set('max', filters.maxPrice === null ? null : String(filters.maxPrice));
  set('stock', filters.inStockOnly ? '1' : null);
  set('sort', filters.sort === 'relevance' ? null : filters.sort);
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    filters.brand !== '' ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.inStockOnly ||
    filters.sort !== 'relevance'
  );
}

export function applyFilters(
  products: readonly CatalogProductViewModel[],
  filters: CatalogFilters,
): readonly CatalogProductViewModel[] {
  const { brand, minPrice, maxPrice, inStockOnly, sort } = filters;
  const filtered = products.filter((product) => {
    if (brand && product.brand !== brand) return false;
    if (inStockOnly && product.inStock === false) return false;
    if (minPrice !== null || maxPrice !== null) {
      const price = parsePrice(product.price);
      if (price === null) return false;
      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;
    }
    return true;
  });

  if (sort === 'relevance') return filtered;

  const byPrice = (p: CatalogProductViewModel) => parsePrice(p.price) ?? Infinity;
  return [...filtered].sort((a, b) =>
    sort === 'name'
      ? a.name.localeCompare(b.name)
      : sort === 'price-asc'
        ? byPrice(a) - byPrice(b)
        : (parsePrice(b.price) ?? -Infinity) - (parsePrice(a.price) ?? -Infinity),
  );
}
