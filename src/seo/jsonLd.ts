import { StorePanel } from '../models/store.models';

const abs = (origin: string, url: string) => (/^https?:\/\//i.test(url) ? url : `${origin}${url}`);

/** schema.org Product. Offer only when the price text has a number (not "Consulte"/"Esgotado"). */
export function productJsonLd(
  product: { id: string; name: string; brand: string; description: string; price: string },
  url: string,
  image?: string,
  inStock = true,
): object {
  const amount = /(\d+(?:[.,]\d+)?)/.exec(product.price)?.[1]?.replace(',', '.');
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.id,
    ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
    ...(product.description && { description: product.description }),
    ...(image && { image }),
    url,
    ...(amount && {
      offers: {
        '@type': 'Offer',
        url,
        price: amount,
        priceCurrency: 'USD',
        availability: `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`,
      },
    }),
  };
}

/**
 * schema.org Store entries for the branches. Phone and hours are left out on purpose: they are
 * placeholders until the Estoque public branch endpoint (Estoque-NY#125) provides real ones.
 */
export function storesJsonLd(stores: readonly StorePanel[], origin: string): object {
  return {
    '@context': 'https://schema.org',
    '@graph': stores.map((store) => ({
      '@type': 'Store',
      '@id': `${origin}/#${store.id}`,
      name: store.name,
      url: `${origin}/#stores`,
      image: abs(origin, `/${store.imageSrc}`),
      address: {
        '@type': 'PostalAddress',
        streetAddress: store.noteLocation,
        addressLocality: 'Uruguaiana',
        addressRegion: 'RS',
        postalCode: /\d{5}-\d{3}/.exec(store.address)?.[0],
        addressCountry: 'BR',
      },
    })),
  };
}
