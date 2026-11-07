// Post-build step (see docs/adr/0001-seo-prerender.md). Using the bundled catalog (the snapshot
// taken at build time) it writes:
//   dist/produto/<slug>/index.html  per product: <title>, Open Graph, Twitter, canonical, JSON-LD
//                                   and a text copy of the product inside #root
//   dist/index.html                 + JSON-LD for the branches
//   dist/sitemap.xml, dist/robots.txt
// Bots (WhatsApp, Telegram, crawlers) do not all run JS, so they need this in the HTML. React
// replaces #root on load. Vercel serves these files before the SPA rewrite.
//
//   SITE_URL=https://example.com node scripts/prerender-products.mjs
//
// SITE_URL falls back to VERCEL_PROJECT_PRODUCTION_URL. Without an origin the sitemap and
// robots.txt are skipped (they need absolute URLs).
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
  const { listProductPages, listStoresJsonLd } = await server.ssrLoadModule(
    '/src/seo/prerenderData.ts',
  );
  const { metaTags, jsonLdScript } = await server.ssrLoadModule('/src/seo/productMeta.ts');
  const assetsDir = path.join(dist, 'assets');
  const builtAssets = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];

  // Dev-server asset URLs (/src/assets/x/name.webp) -> the hashed file Vite emitted.
  const publicImage = (src) => {
    if (!src) return undefined;
    if (/^https?:\/\//i.test(src)) return src;
    const ext = path.extname(src);
    const base = path.basename(src, ext);
    const hit = builtAssets.find((f) => f.startsWith(`${base}-`) && f.endsWith(ext));
    return hit ? `${origin}/assets/${hit}` : undefined;
  };

  const pages = listProductPages(origin);
  for (const page of pages) {
    const image = publicImage(page.image);
    const meta = { ...page.meta, image, jsonLd: page.jsonLd(image) };
    const html = template
      .replace(/<title>.*?<\/title>/s, () => `<title>${page.title}</title>`)
      .replace('</head>', () => `    ${metaTags(meta)}\n  </head>`)
      .replace(
        '<div id="root"></div>',
        () =>
          `<div id="root"><main><h1>${page.name}</h1><p>${page.brand}</p><p>${page.description}</p><p>${page.price}</p></main></div>`,
      );
    const dir = path.join(dist, 'produto', page.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }

  fs.writeFileSync(
    path.join(dist, 'index.html'),
    template.replace('</head>', () => `    ${jsonLdScript(listStoresJsonLd(origin))}\n  </head>`),
  );

  if (origin) {
    const urls = ['/', ...pages.map((p) => p.meta.url.slice(origin.length))];
    const entries = urls.map((u) => `  <url><loc>${origin}${u}</loc></url>`).join('\n');
    fs.writeFileSync(
      path.join(dist, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    );
    fs.writeFileSync(
      path.join(dist, 'robots.txt'),
      `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
    );
  } else {
    console.warn('prerender-products: SITE_URL not set, sitemap.xml and robots.txt skipped');
  }
  console.log(`prerender-products: ${pages.length} product pages`);
} finally {
  await server.close();
}
