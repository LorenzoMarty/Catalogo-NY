// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { applyProductMeta, buildProductMeta, metaTags } from './productMeta';

const product = {
  name: 'Black Label 1L',
  brand: 'Johnnie Walker',
  price: 'US$ 30',
  description: '',
};

describe('productMeta', () => {
  it('builds absolute url and falls back to a generated description', () => {
    const meta = buildProductMeta(
      product,
      'https://x.com/',
      '/produto/a-1',
      'https://x.com/i.webp',
    );
    expect(meta.url).toBe('https://x.com/produto/a-1');
    expect(meta.description).toContain('Johnnie Walker');
  });

  it('escapes values and emits og/twitter tags', () => {
    const html = metaTags(
      buildProductMeta({ ...product, name: 'A "B" <c>' }, 'https://x.com', '/p', 'https://x.com/i'),
    );
    expect(html).toContain('property="og:image" content="https://x.com/i"');
    expect(html).toContain('A &quot;B&quot; &lt;c&gt;');
    expect(html).toContain('rel="canonical"');
  });

  it('applies to the document and cleans up', () => {
    const before = document.title;
    const cleanup = applyProductMeta(buildProductMeta(product, 'https://x.com', '/p'));
    expect(document.title).toBe('Black Label 1L | New York Freeshop');
    expect(document.head.querySelector('meta[property="og:title"]')).not.toBeNull();
    cleanup();
    expect(document.title).toBe(before);
    expect(document.head.querySelector('[data-seo]')).toBeNull();
  });
});
