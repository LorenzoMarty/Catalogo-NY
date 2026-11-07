import { getCatalogSearchProducts } from '../services/catalogService';
import { productPath, productSlug } from '../utils/productSlug';
import { buildProductMeta, ProductMeta } from './productMeta';

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface ProductPageData {
  readonly slug: string;
  readonly name: string;
  readonly brand: string;
  readonly description: string;
  readonly price: string;
  readonly image?: string;
  readonly meta: ProductMeta;
}

/** One entry per bundled-catalog product, with text already HTML-escaped for the prerender. */
export function listProductPages(origin: string): readonly ProductPageData[] {
  return getCatalogSearchProducts().map((product) => {
    const price = product.inStock === false ? 'Esgotado' : product.price.replace(/\s+info$/i, '');
    const meta = buildProductMeta({ ...product, price }, origin, productPath(product));
    return {
      slug: productSlug(product),
      name: esc(product.name),
      brand: esc(product.brand),
      description: esc(product.description),
      price: esc(price),
      image: product.imageAsset?.src,
      meta: { ...meta, title: esc(meta.title) },
    };
  });
}
