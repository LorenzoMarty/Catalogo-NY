import { describe, expect, it } from 'vitest';
import { fetchRemoteCatalog, parseRemoteCatalog, toCatalogData } from './catalogApi';
import { buildCatalogViewModel, getCatalogSearchProducts } from './catalogService';

const product = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  brand: 'Dior',
  name: 'Sauvage Elixir 60ml',
  description: 'Fragrancia amadeirada',
  price_usd: '129.00',
  price_is_from: false,
  featured: false,
  image_url: 'https://cdn.example.com/sauvage.webp',
  in_stock: true,
  ...overrides,
});

const payload = (sectors: unknown = [{ name: 'Perfumaria', products: [product()] }]) => ({
  sectors,
});

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const ok = init.ok ?? true;
  return { ok, status: init.status ?? (ok ? 200 : 500), json: async () => body } as Response;
}

describe('parseRemoteCatalog', () => {
  it.each([
    ['null', null],
    ['no sectors', {}],
    ['sectors not an array', { sectors: 'x' }],
    ['sector without name', { sectors: [{ products: [] }] }],
    ['product without name', { sectors: [{ name: 'A', products: [{ ...product(), name: 5 }] }] }],
    ['product without id', { sectors: [{ name: 'A', products: [{ ...product(), id: undefined }] }] }],
  ])('rejects %s', (_label, body) => {
    expect(parseRemoteCatalog(body)).toBeNull();
  });

  it('accepts a well formed payload', () => {
    expect(parseRemoteCatalog(payload())?.sectors).toHaveLength(1);
  });
});

describe('toCatalogData', () => {
  it('reuses the visual style of the matching static sector', () => {
    const data = toCatalogData(parseRemoteCatalog(payload())!);

    expect(data.sectors[0].id).toBe('perfumery');
    expect(data.sectors[0].accent).toMatch(/^#/);
  });

  it('matches sector names ignoring case and accents', () => {
    const data = toCatalogData(parseRemoteCatalog(payload([{ name: 'PERFUMARIA ', products: [product()] }]))!);

    expect(data.sectors[0].id).toBe('perfumery');
  });

  it('gives an unknown category a neutral style and a slug id', () => {
    const data = toCatalogData(
      parseRemoteCatalog(payload([{ name: 'Brinquedos & Jogos', products: [product()] }]))!,
    );

    expect(data.sectors[0].id).toBe('brinquedos-jogos');
    expect(data.sectors[0].name).toBe('Brinquedos & Jogos');
    expect(data.sectors[0].icon).toContain('<svg');
  });

  it('formats prices, including "a partir de" and missing price', () => {
    const data = toCatalogData(
      parseRemoteCatalog(
        payload([
          {
            name: 'Perfumaria',
            products: [
              product({ id: 1, price_usd: '129.00' }),
              product({ id: 2, price_usd: '99.50', price_is_from: true }),
              product({ id: 3, price_usd: null }),
            ],
          },
        ]),
      )!,
    );

    expect(data.sectors[0].products.map((p) => p.price)).toEqual([
      'US$ 129',
      'a partir de US$ 99.50',
      'Consulte',
    ]);
  });

  it('keeps out-of-stock products and flags them', () => {
    const data = toCatalogData(
      parseRemoteCatalog(payload([{ name: 'Perfumaria', products: [product({ in_stock: false })] }]))!,
    );

    expect(data.sectors[0].products[0].inStock).toBe(false);
  });

  it('builds the image from image_url and leaves it out when absent', () => {
    const data = toCatalogData(
      parseRemoteCatalog(
        payload([
          {
            name: 'Perfumaria',
            products: [product({ id: 1 }), product({ id: 2, image_url: null })],
          },
        ]),
      )!,
    );

    expect(data.images['1'].src).toBe('https://cdn.example.com/sauvage.webp');
    expect(data.images['2']).toBeUndefined();
  });

  it('uses featured products for the home mix, falling back to the first ones', () => {
    const withFeatured = toCatalogData(
      parseRemoteCatalog(
        payload([
          {
            name: 'Perfumaria',
            products: [product({ id: 1 }), product({ id: 2, featured: true })],
          },
        ]),
      )!,
    );
    const withoutFeatured = toCatalogData(
      parseRemoteCatalog(
        payload([{ name: 'Perfumaria', products: [product({ id: 1 }), product({ id: 2 })] }]),
      )!,
    );

    expect(withFeatured.featuredMix).toEqual(['2']);
    expect(withoutFeatured.featuredMix).toEqual(['1', '2']);
  });

  it('feeds the existing view model and search with remote products', () => {
    const data = toCatalogData(parseRemoteCatalog(payload())!);

    const view = buildCatalogViewModel('perfumery', data);
    const search = getCatalogSearchProducts(data);

    expect(view.products.map((p) => p.name)).toEqual(['Sauvage Elixir 60ml']);
    expect(search[0].searchTags.length).toBeGreaterThan(0);
    expect(search[0].imageAsset?.src).toBe('https://cdn.example.com/sauvage.webp');
  });
});

describe('fetchRemoteCatalog', () => {
  it('returns mapped data from ${baseUrl}/public/catalog', async () => {
    let requested = '';
    const fetchImpl = (async (url: string) => {
      requested = url;
      return jsonResponse(payload());
    }) as unknown as typeof fetch;

    const data = await fetchRemoteCatalog('http://api.test/', { fetchImpl });

    expect(requested).toBe('http://api.test/public/catalog');
    expect(data?.sectors[0].products).toHaveLength(1);
  });

  it.each([
    ['http error', async () => jsonResponse({}, { ok: false, status: 500 })],
    ['invalid shape', async () => jsonResponse({ nope: true })],
    ['invalid json', async () => ({ ok: true, json: async () => { throw new Error('bad json'); } }) as unknown as Response],
    ['network failure', async () => { throw new TypeError('Failed to fetch'); }],
  ])('returns null on %s', async (_label, impl) => {
    expect(await fetchRemoteCatalog('http://api.test', { fetchImpl: impl as unknown as typeof fetch })).toBeNull();
  });

  it('returns null when the request exceeds the timeout', async () => {
    const fetchImpl = ((_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      })) as unknown as typeof fetch;

    expect(await fetchRemoteCatalog('http://api.test', { fetchImpl, timeoutMs: 20 })).toBeNull();
  });

  it('returns null without calling the API when no base url is configured', async () => {
    let called = false;
    const fetchImpl = (async () => {
      called = true;
      return jsonResponse(payload());
    }) as unknown as typeof fetch;

    expect(await fetchRemoteCatalog('', { fetchImpl })).toBeNull();
    expect(called).toBe(false);
  });
});
