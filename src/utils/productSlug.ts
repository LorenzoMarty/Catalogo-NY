import { normalizeName } from '../services/catalogApi';

/** URL slug for a product: readable name plus the id, which is what resolves it back. */
export function productSlug(product: { id: string; name: string }): string {
  const readable = normalizeName(product.name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return readable ? `${readable}-${product.id}` : product.id;
}

/** The product id encoded at the end of a slug (ids never contain "-"). */
export function productIdFromSlug(slug: string): string {
  return slug.slice(slug.lastIndexOf('-') + 1);
}

export const productPath = (product: { id: string; name: string }) =>
  `/produto/${productSlug(product)}`;
