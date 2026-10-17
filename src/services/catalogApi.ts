import { CATALOG_SECTORS } from '../data/catalog.data';
import {
  CatalogBrand,
  CatalogData,
  CatalogImageManifest,
  CatalogProduct,
  CatalogSector,
} from '../models/catalog.models';

export interface RemoteProduct {
  readonly id: number;
  readonly brand: string;
  readonly name: string;
  readonly description: string;
  readonly price_usd: string | null;
  readonly price_is_from: boolean;
  readonly featured: boolean;
  readonly image_url: string | null;
  readonly in_stock: boolean;
}

export interface RemoteCatalog {
  readonly sectors: readonly {
    readonly name: string;
    readonly products: readonly RemoteProduct[];
  }[];
}

interface FetchOptions {
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 4000;
const FEATURED_FALLBACK_SIZE = 10;
const NEUTRAL_ICON = `
  <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 22L32 13L50 22V43L32 52L14 43V22Z"></path>
    <path d="M14 22L32 31L50 22"></path>
    <path d="M32 31V52"></path>
  </svg>
`;
const NEUTRAL_STYLE = {
  sup: 'new',
  accent: '#093b95',
  soft: 'rgba(9, 59, 149, 0.12)',
  icon: NEUTRAL_ICON,
  description: 'Seleção de produtos da loja New York Free Shop.',
  brandNote: '',
} as const;

export function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

function slugify(value: string): string {
  return normalizeName(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function parseProduct(value: unknown): RemoteProduct | null {
  if (!isRecord(value) || typeof value.id !== 'number' || typeof value.name !== 'string') {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    brand: typeof value.brand === 'string' ? value.brand : '',
    description: typeof value.description === 'string' ? value.description : '',
    price_usd: typeof value.price_usd === 'string' ? value.price_usd : null,
    price_is_from: value.price_is_from === true,
    featured: value.featured === true,
    image_url: typeof value.image_url === 'string' ? value.image_url : null,
    in_stock: value.in_stock !== false,
  };
}

export function parseRemoteCatalog(value: unknown): RemoteCatalog | null {
  if (!isRecord(value) || !Array.isArray(value.sectors)) {
    return null;
  }

  const sectors: { name: string; products: RemoteProduct[] }[] = [];
  for (const sector of value.sectors) {
    if (!isRecord(sector) || typeof sector.name !== 'string' || !Array.isArray(sector.products)) {
      return null;
    }
    const products = sector.products.map(parseProduct);
    if (products.some((product) => product === null)) {
      return null;
    }
    sectors.push({ name: sector.name, products: products as RemoteProduct[] });
  }

  return { sectors };
}

function formatPrice(product: RemoteProduct): string {
  if (product.price_usd === null) {
    return 'Consulte';
  }

  const amount = Number(product.price_usd);
  const text = `US$ ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
  return product.price_is_from ? `a partir de ${text}` : text;
}

const staticSectorsByName = new Map(
  CATALOG_SECTORS.map((sector) => [normalizeName(sector.name), sector]),
);
const staticBrandsByName = new Map(
  CATALOG_SECTORS.flatMap((sector) => sector.brands).map((brand) => [brand.name, brand]),
);

function buildBrands(products: readonly RemoteProduct[]): readonly CatalogBrand[] {
  const names = [...new Set(products.map((product) => product.brand).filter(Boolean))];
  return names.map((name) => staticBrandsByName.get(name) ?? { name });
}

export function toCatalogData(remote: RemoteCatalog): CatalogData {
  const images: Record<string, CatalogImageManifest[string]> = {};
  const featured: string[] = [];
  const everyone: string[] = [];

  const sectors = remote.sectors.map((remoteSector): CatalogSector => {
    const style = staticSectorsByName.get(normalizeName(remoteSector.name)) ?? NEUTRAL_STYLE;
    const id = 'id' in style ? style.id : slugify(remoteSector.name);

    const products = remoteSector.products.map((product): CatalogProduct => {
      const productId = String(product.id);
      everyone.push(productId);
      if (product.featured) {
        featured.push(productId);
      }
      if (product.image_url) {
        images[productId] = {
          id: productId,
          brand: product.brand,
          name: product.name,
          sourceHash: '',
          src: product.image_url,
          width: 1200,
          height: 1800,
        };
      }

      return {
        id: productId,
        brand: product.brand,
        name: product.name,
        note: '',
        price: formatPrice(product),
        description: product.description,
        tone: style.soft,
        inStock: product.in_stock,
      };
    });

    return {
      id,
      name: remoteSector.name,
      sup: style.sup,
      accent: style.accent,
      soft: style.soft,
      icon: style.icon,
      description: style.description,
      brandNote: style.brandNote,
      brands: buildBrands(remoteSector.products),
      products,
    };
  });

  return {
    sectors,
    featuredMix: featured.length > 0 ? featured : everyone.slice(0, FEATURED_FALLBACK_SIZE),
    images,
  };
}

export async function fetchRemoteCatalog(
  baseUrl: string,
  { fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS }: FetchOptions = {},
): Promise<CatalogData | null> {
  const root = baseUrl.trim().replace(/\/+$/, '');
  if (!root) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${root}/public/catalog`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    const remote = parseRemoteCatalog(await response.json());
    return remote ? toCatalogData(remote) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
