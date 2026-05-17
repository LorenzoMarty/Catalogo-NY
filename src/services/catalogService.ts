import rawImageManifest from '../../data/catalog-image-manifest.json';
import { CATALOG_FEATURED_MIX, CATALOG_SECTORS, getCatalogBrandMark } from '../data/catalog.data';
import {
  CatalogImageAsset,
  CatalogImageManifest,
  CatalogProductViewModel,
  CatalogSectionViewModel,
  CatalogSector,
} from '../models/catalog.models';
import { resolveAssetPath, resolveSrcSet } from '../utils/assets';

type CatalogBaseProduct = Omit<CatalogProductViewModel, 'imageAsset'>;

const sectors = CATALOG_SECTORS;
const featuredMix = CATALOG_FEATURED_MIX;
const baseProducts = buildBaseProducts();
const baseProductMap = buildBaseProductMap();
const imageManifest = normalizeImageManifest(rawImageManifest as CatalogImageManifest);

export function createInitialCatalogViewModel(): CatalogSectionViewModel {
  return buildCatalogViewModel(null);
}

export function getCatalogSearchProducts(): readonly CatalogProductViewModel[] {
  return baseProducts.map((product) => hydrateProduct(product));
}

export function buildCatalogViewModel(sectorId: string | null): CatalogSectionViewModel {
  const currentSector = getSectorById(sectorId);
  const products = getVisibleProducts(currentSector);
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

function buildBaseProducts(): readonly CatalogBaseProduct[] {
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

function buildBaseProductMap(): Readonly<Record<string, CatalogBaseProduct>> {
  return baseProducts.reduce<Record<string, CatalogBaseProduct>>((productMap, product) => {
    productMap[product.id] = product;
    return productMap;
  }, {});
}

function getVisibleProducts(
  currentSector: CatalogSector | null,
): readonly CatalogProductViewModel[] {
  const visibleBaseProducts = currentSector
    ? baseProducts.filter((product) => product.sectorId === currentSector.id)
    : featuredMix.map((productId) => baseProductMap[productId]).filter(Boolean);

  return visibleBaseProducts.map((product) => hydrateProduct(product));
}

function hydrateProduct(product: CatalogBaseProduct): CatalogProductViewModel {
  return {
    ...product,
    imageAsset: imageManifest[product.id] ?? null,
  };
}

function getSectorById(sectorId: string | null): CatalogSector | null {
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
