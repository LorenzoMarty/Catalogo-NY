import { STORE_PANELS } from '../data/stores.data';
import { getCatalogSearchProducts } from '../services/catalogService';
import { productPath, productSlug } from '../utils/productSlug';
import { productJsonLd, storesJsonLd } from './jsonLd';
import { buildProductMeta, ProductMeta } from './productMeta';

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const listStoresJsonLd = (origin: string) => storesJsonLd(STORE_PANELS, origin);

export interface ProductPageData {
  readonly slug: string;
  /** HTML-escaped <title> text. */
  readonly title: string;
  readonly name: string;
  readonly brand: string;
  readonly description: string;
  readonly price: string;
  readonly image?: string;
  readonly meta: ProductMeta;
  /** Needs the final public image URL, which only the build knows. */
  readonly jsonLd: (image?: string) => object;
}

/** One entry per bundled-catalog product, with text already HTML-escaped for the prerender. */
export function listProductPages(origin: string): readonly ProductPageData[] {
  return getCatalogSearchProducts().map((product) => {
    const rawPrice = product.price.replace(/\s+info$/i, '');
    const price = product.inStock === false ? 'Esgotado' : rawPrice;
    const meta = buildProductMeta({ ...product, price }, origin, productPath(product));
    return {
      slug: productSlug(product),
      title: esc(meta.title),
      name: esc(product.name),
      brand: esc(product.brand),
      description: esc(product.description),
      price: esc(price),
      image: product.imageAsset?.src,
      meta,
      jsonLd: (image) =>
        productJsonLd({ ...product, price: rawPrice }, meta.url, image, product.inStock !== false),
    };
  });
}
