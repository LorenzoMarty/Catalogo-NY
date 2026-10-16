import rawImageManifest from '../../data/catalog-image-manifest.json';
import rawSnapshot from '../../data/catalog-snapshot.json';
import { CATALOG_FEATURED_MIX, CATALOG_SECTORS, getCatalogBrandMark } from '../data/catalog.data';
import {
  CatalogData,
  CatalogImageAsset,
  CatalogImageManifest,
  CatalogProductViewModel,
  CatalogSectionViewModel,
  CatalogSector,
} from '../models/catalog.models';
import { resolveAssetPath, resolveSrcSet } from '../utils/assets';
import { parseRemoteCatalog, toCatalogData } from './catalogApi';

type CatalogBaseProduct = Omit<CatalogProductViewModel, 'imageAsset'>;

interface DerivedCatalog {
  readonly data: CatalogData;
  readonly baseProducts: readonly CatalogBaseProduct[];
  readonly baseProductMap: Readonly<Record<string, CatalogBaseProduct>>;
}

const HAND_MADE_CATALOG: CatalogData = {
  sectors: CATALOG_SECTORS,
  featuredMix: CATALOG_FEATURED_MIX,
  images: normalizeImageManifest(rawImageManifest as CatalogImageManifest),
};

/**
 * The bundled catalog: the snapshot `npm run build` takes from the API (data/catalog-snapshot.json)
 * when it has products, otherwise the hand-made one, which also covers the committed empty seed
 * and offline builds.
 */
export function pickBundledCatalog(snapshot: unknown): CatalogData {
  // The snapshot is raw API output, so it goes through the same parser as a live response
  // (which turns the API's nulls into the empty strings the UI expects).
  const parsed = parseRemoteCatalog(snapshot);
  const hasProducts = parsed?.sectors.some((sector) => sector.products.length > 0) ?? false;
  return parsed && hasProducts ? toCatalogData(parsed) : HAND_MADE_CATALOG;
}

export const STATIC_CATALOG: CatalogData = pickBundledCatalog(rawSnapshot);

const derivedCache = new WeakMap<CatalogData, DerivedCatalog>();

function derive(data: CatalogData): DerivedCatalog {
  const cached = derivedCache.get(data);
  if (cached) {
    return cached;
  }

  const baseProducts = buildBaseProducts(data.sectors);
  const derived = { data, baseProducts, baseProductMap: buildBaseProductMap(baseProducts) };
  derivedCache.set(data, derived);
  return derived;
}

export function createInitialCatalogViewModel(): CatalogSectionViewModel {
  return buildCatalogViewModel(null);
}

export function getCatalogSearchProducts(
  data: CatalogData = STATIC_CATALOG,
): readonly CatalogProductViewModel[] {
  const catalog = derive(data);
  return catalog.baseProducts.map((product) => hydrateProduct(product, data.images));
}

export function buildCatalogViewModel(
  sectorId: string | null,
  data: CatalogData = STATIC_CATALOG,
): CatalogSectionViewModel {
  const catalog = derive(data);
  const { sectors } = data;
  const currentSector = getSectorById(sectors, sectorId);
  const products = getVisibleProducts(catalog, currentSector);
  const productMap = products.reduce<Record<string, CatalogProductViewModel>>(
    (mapById, product) => {
      mapById[product.id] = product;
      return mapById;
    },
    {},
  );

  return {
    sectors,
    currentSector,
    products,
    productMap,
    resultsKicker: '',
    resultsHeading: currentSector?.name ?? 'Produtos para descobrir',
    brandAnimationDuration: `${Math.max(34, (currentSector?.brands.length ?? 0) * 8)}s`,
  };
}

function buildBaseProducts(sectors: readonly CatalogSector[]): readonly CatalogBaseProduct[] {
  return sectors.flatMap((sector) =>
    sector.products.map((product) => ({
      ...product,
      sectorId: sector.id,
      sectorName: sector.name,
      accent: sector.accent,
      accentSoft: sector.soft,
      brandMark: product.brandMark ?? getCatalogBrandMark(product.brand),
      searchTags: createProductTags(product, sector),
    })),
  );
}

function createProductTags(
  product: CatalogSector['products'][number],
  sector: CatalogSector,
): readonly string[] {
  return [
    product.brand,
    product.name,
    product.note,
    product.description,
    sector.id,
    sector.name,
    sector.sup,
    ...product.name.split(/\s+/),
    ...product.note.split(/\s+/),
  ]
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildBaseProductMap(
  baseProducts: readonly CatalogBaseProduct[],
): Readonly<Record<string, CatalogBaseProduct>> {
  return baseProducts.reduce<Record<string, CatalogBaseProduct>>((productMap, product) => {
    productMap[product.id] = product;
    return productMap;
  }, {});
}

function getVisibleProducts(
  catalog: DerivedCatalog,
  currentSector: CatalogSector | null,
): readonly CatalogProductViewModel[] {
  const visibleBaseProducts = currentSector
    ? catalog.baseProducts.filter((product) => product.sectorId === currentSector.id)
    : catalog.data.featuredMix
        .map((productId) => catalog.baseProductMap[productId])
        .filter(Boolean);

  return visibleBaseProducts.map((product) => hydrateProduct(product, catalog.data.images));
}

function hydrateProduct(
  product: CatalogBaseProduct,
  images: CatalogImageManifest,
): CatalogProductViewModel {
  return {
    ...product,
    imageAsset: images[product.id] ?? null,
  };
}

function getSectorById(
  sectors: readonly CatalogSector[],
  sectorId: string | null,
): CatalogSector | null {
  return sectors.find((sector) => sector.id === sectorId) ?? null;
}

function normalizeImageManifest(manifest: CatalogImageManifest): CatalogImageManifest {
  return Object.fromEntries(
    Object.entries(manifest).map(([productId, asset]) => [productId, normalizeImageAsset(asset)]),
  );
}

function normalizeImageAsset(asset: CatalogImageAsset): CatalogImageAsset {
  return {
    ...asset,
    src: resolveAssetPath(asset.src),
    thumb: asset.thumb ? resolveAssetPath(asset.thumb) : asset.thumb,
    srcset: resolveSrcSet(asset.srcset),
  };
}
