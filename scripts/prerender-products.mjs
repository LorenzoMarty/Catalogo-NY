// Post-build step: writes dist/produto/<slug>/index.html for every product of the bundled
// catalog (snapshot taken at build time), with product-specific <title>, Open Graph, canonical
// and a text copy of the product inside #root. Link-preview bots (WhatsApp, Telegram) and
// crawlers do not run JS, so they need these tags in the HTML. React replaces #root on load.
//
//   SITE_URL=https://example.com node scripts/prerender-products.mjs
//
// SITE_URL falls back to VERCEL_PROJECT_PRODUCTION_URL; with neither, og:url/og:image are
// skipped-absolute (relative), which previews ignore, so set it in production.
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const dist = path.resolve('dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const origin = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '')
).replace(/\/+$/, '');

const server = await createServer({
  appType: 'custom',
  server: { middlewareMode: true },
  logLevel: 'error',
});
try {
  const { listProductPages } = await server.ssrLoadModule('/src/seo/prerenderData.ts');
  const { metaTags } = await server.ssrLoadModule('/src/seo/productMeta.ts');
  const builtAssets = fs.existsSync(path.join(dist, 'assets'))
    ? fs.readdirSync(path.join(dist, 'assets'))
    : [];

  // Dev-server asset URLs (/src/assets/x/name.webp) -> the hashed file Vite emitted.
  const publicImage = (src) => {
    if (!src) return undefined;
    if (/^https?:\/\//i.test(src)) return src;
    const base = path.basename(src, path.extname(src));
    const hit = builtAssets.find((f) => f.startsWith(`${base}-`) && f.endsWith(path.extname(src)));
    return hit ? `${origin}/assets/${hit}` : undefined;
  };

  const pages = listProductPages(origin);
  for (const page of pages) {
    const meta = { ...page.meta, image: publicImage(page.image) };
    let html = template
      .replace(/<title>.*?<\/title>/s, `<title>${meta.title}</title>`)
      .replace('</head>', `    ${metaTags(meta)}\n  </head>`)
      .replace(
        '<div id="root"></div>',
        `<div id="root"><main><h1>${page.name}</h1><p>${page.brand}</p><p>${page.description}</p><p>${page.price}</p></main></div>`,
      );
    const dir = path.join(dist, 'produto', page.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }
  console.log(`prerender-products: ${pages.length} product pages`);
} finally {
  await server.close();
}
