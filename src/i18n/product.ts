import { CatalogProduct } from '../models/catalog.models';
import { Lang } from './core';

/**
 * Name and description in `lang`. The API may send `translations` per language (Estoque-NY#66);
 * a language or field it does not provide falls back to the Portuguese source text.
 */
export function localizedText(
  product: Pick<CatalogProduct, 'name' | 'description' | 'translations'>,
  lang: Lang,
): { name: string; description: string } {
  const entry = product.translations?.[lang];
  return {
    name: entry?.name?.trim() || product.name,
    description: entry?.description?.trim() || product.description,
  };
}
