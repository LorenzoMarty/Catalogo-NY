# ADR 0001: SEO via build-time prerender, not a framework migration

Status: accepted (autonomous decision, reversible)

## Context

The site is a client-rendered Vite SPA. Crawlers and link-preview bots (WhatsApp, Telegram) may not
run JS, so product pages, Open Graph tags and structured data must exist in the served HTML.
Options considered:

1. Prerender plugin (e.g. vite-plugin-prerender / puppeteer): new heavy dependency, headless
   browser in the build, flaky on Vercel.
2. Framework migration (Next.js / Astro): best long-term SEO, but rewrites the app (Lenis, framer,
   router) for a catalog of ~20 products. Disproportionate.
3. **Postbuild script** that loads the bundled catalog through Vite SSR module loading and writes
   static HTML per product (`scripts/prerender-products.mjs`). No new dependency.

## Decision

Option 3. The script emits `dist/produto/<slug>/index.html` (title, Open Graph, Twitter, canonical,
JSON-LD `Product` and a text copy of the product), JSON-LD `Store` on the home page, `sitemap.xml`
and `robots.txt`. React still takes over `#root` on load; the same meta is applied client-side on
navigation.

## Consequences

- Pages exist only for products in the build-time snapshot (`npm run build` refreshes it from the
  API). A product published later works via the SPA route but is not crawlable until the next
  build: Estoque-NY#61 (publish triggers rebuild) closes that gap.
- `SITE_URL` (or `VERCEL_PROJECT_PRODUCTION_URL`) must be set so sitemap/canonical/og URLs are
  absolute.
- Revisit (migrate to a SSR/SSG framework) if the catalog grows to thousands of products or needs
  per-request rendering; this ADR's data layer (`src/seo/*`) is framework-agnostic.
- Branch phone/hours are left out of JSON-LD until they are real (Estoque-NY#125).
