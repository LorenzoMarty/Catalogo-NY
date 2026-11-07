import { describe, expect, it } from 'vitest';
import { productIdFromSlug, productPath, productSlug } from './productSlug';

describe('productSlug', () => {
  it('builds a readable slug ending in the id and resolves back', () => {
    const slug = productSlug({ id: '42', name: 'Chanel Nº 5 Eau de Parfum' });
    expect(slug).toBe('chanel-n-5-eau-de-parfum-42');
    expect(productIdFromSlug(slug)).toBe('42');
  });

  it('works for string ids and names without letters', () => {
    expect(productIdFromSlug(productSlug({ id: 'dr1', name: 'Black Label 1L' }))).toBe('dr1');
    expect(productSlug({ id: '7', name: '***' })).toBe('7');
    expect(productIdFromSlug('7')).toBe('7');
  });

  it('prefixes the product route', () => {
    expect(productPath({ id: '1', name: 'A B' })).toBe('/produto/a-b-1');
  });
});
