export interface ProductMeta {
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly image?: string;
  /** schema.org object, emitted as a JSON-LD script. */
  readonly jsonLd?: object;
}

const SITE = 'New York Freeshop';

export function buildProductMeta(
  product: { name: string; brand: string; price: string; description: string },
  origin: string,
  path: string,
  image?: string,
): ProductMeta {
  const description =
    product.description.trim() ||
    `${product.name} ${product.brand ? `da ${product.brand} ` : ''}na ${SITE}. ${product.price}`.trim();
  return {
    title: `${product.name} | ${SITE}`,
    description,
    url: `${origin.replace(/\/+$/, '')}${path}`,
    image,
  };
}

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Head tags (without <title>) for a product page: description, canonical, Open Graph, Twitter. */
export function metaTags(meta: ProductMeta): string {
  const tags: [string, string, string][] = [
    ['name', 'description', meta.description],
    ['property', 'og:type', 'product'],
    ['property', 'og:site_name', SITE],
    ['property', 'og:title', meta.title],
    ['property', 'og:description', meta.description],
    ['property', 'og:url', meta.url],
    ['name', 'twitter:card', meta.image ? 'summary_large_image' : 'summary'],
    ['name', 'twitter:title', meta.title],
    ['name', 'twitter:description', meta.description],
  ];
  if (meta.image) {
    tags.push(['property', 'og:image', meta.image], ['name', 'twitter:image', meta.image]);
  }
  const metas = tags.map(([k, n, c]) => `<meta data-seo ${k}="${n}" content="${esc(c)}" />`);
  const extra = [`<link data-seo rel="canonical" href="${esc(meta.url)}" />`];
  if (meta.jsonLd) extra.push(jsonLdScript(meta.jsonLd));
  return [...metas, ...extra].join('\n    ');
}

/** Applies the meta to the live document (client-side navigation, JS-capable crawlers). */
export function applyProductMeta(meta: ProductMeta, doc: Document = document): () => void {
  const previousTitle = doc.title;
  doc.title = meta.title;
  const holder = doc.createElement('template');
  holder.innerHTML = metaTags(meta);
  // Drop tags prerendered into the static HTML so the live ones are not duplicated.
  doc.head.querySelectorAll('[data-seo]').forEach((node) => node.remove());
  const nodes = Array.from(holder.content.children);
  nodes.forEach((node) => doc.head.appendChild(node));
  return () => {
    doc.title = previousTitle;
    nodes.forEach((node) => node.remove());
  };
}

/** JSON-LD <script>; "<" is escaped so the payload can never close the tag. */
export function jsonLdScript(data: object): string {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script data-seo type="application/ld+json">${json}</script>`;
}
