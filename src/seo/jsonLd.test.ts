import { describe, expect, it } from 'vitest';
import { STORE_PANELS } from '../data/stores.data';
import { productJsonLd, storesJsonLd } from './jsonLd';
import { jsonLdScript } from './productMeta';

const p = { id: '1', name: 'A', brand: 'B', description: 'd', price: 'US$ 12,50' };

describe('jsonLd', () => {
  it('builds a Product with an Offer when the price is numeric', () => {
    const ld = productJsonLd(p, 'https://x/p', 'https://x/i.webp') as {
      '@type': string;
      offers: { price: string; availability: string };
    };
    expect(ld['@type']).toBe('Product');
    expect(ld.offers.price).toBe('12.50');
    expect(ld.offers.availability).toContain('InStock');
  });

  it('omits the Offer for non-numeric prices', () => {
    expect(productJsonLd({ ...p, price: 'Consulte' }, 'u')).not.toHaveProperty('offers');
  });

  it('lists every branch as a Store with an address', () => {
    const ld = storesJsonLd(STORE_PANELS, 'https://x') as {
      '@graph': { address: { postalCode: string } }[];
    };
    expect(ld['@graph']).toHaveLength(STORE_PANELS.length);
    expect(ld['@graph'][0].address.postalCode).toMatch(/^\d{5}-\d{3}$/);
  });

  it('cannot break out of the script tag', () => {
    expect(jsonLdScript({ a: '</script><b>' })).not.toContain('</script><b>');
  });
});
