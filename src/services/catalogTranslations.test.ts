import { describe, expect, it } from 'vitest';
import { parseRemoteCatalog, toCatalogData } from './catalogApi';

const raw = (translations: unknown) => ({
  sectors: [
    {
      name: 'Perfumes',
      products: [
        {
          id: 1,
          brand: 'B',
          name: 'Perfume',
          description: 'd',
          price_usd: '10.00',
          price_is_from: false,
          featured: true,
          image_url: null,
          in_stock: true,
          translations,
        },
      ],
    },
  ],
});

describe('API translations', () => {
  it('keeps well-formed per-language name/description and drops junk', () => {
    const remote = parseRemoteCatalog(raw({ en: { name: 'Fragrance' }, es: 5, fr: {} }));
    const product = toCatalogData(remote!).sectors[0].products[0];
    expect(product.translations).toEqual({ en: { name: 'Fragrance', description: undefined } });
  });

  it('works without translations (current API)', () => {
    const product = toCatalogData(parseRemoteCatalog(raw(undefined))!).sectors[0].products[0];
    expect(product.translations).toBeUndefined();
  });
});
