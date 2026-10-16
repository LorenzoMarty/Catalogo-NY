// Refreshes data/catalog-snapshot.json from the Estoque API so the bundled fallback
// catalog equals what the API serves at build time (ADR 0001 in Estoque-NY).
//
//   CATALOG_API_URL=https://api.example.com node scripts/snapshot-catalog.cjs
//
// Runs as `prebuild`. The build must keep working when the API is down or not
// configured, so by default every failure is a warning and the committed snapshot
// (a minimal seed) stays untouched. Pass --require (a release build) to fail instead.
const fs = require('node:fs');
const path = require('node:path');

const SNAPSHOT =
  process.env.CATALOG_SNAPSHOT_PATH ?? path.join(__dirname, '..', 'data', 'catalog-snapshot.json');
const REQUIRE = process.argv.includes('--require');
const BASE = (process.env.CATALOG_API_URL ?? process.env.VITE_API_URL ?? '')
  .trim()
  .replace(/\/+$/, '');
const TIMEOUT_MS = Number(process.env.CATALOG_API_TIMEOUT_MS ?? 15000);
const MAX_PAGES = 20;
const PAGE_SIZE = 500;

function giveUp(message) {
  if (REQUIRE) {
    console.error(`snapshot-catalog: ${message}`);
    process.exit(1);
  }
  console.warn(`snapshot-catalog: ${message}; keeping ${path.relative(process.cwd(), SNAPSHOT)}`);
  process.exit(0);
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return {
    status: response.status,
    ok: response.ok,
    body: response.ok ? await response.json() : null,
  };
}

/** Product pages are merged by sector name, in the order the API returned them. */
function mergePages(pages) {
  const sectors = new Map();
  for (const page of pages) {
    for (const sector of page.sectors) {
      const known = sectors.get(sector.name);
      if (known) {
        known.products.push(...sector.products);
      } else {
        sectors.set(sector.name, { name: sector.name, products: [...sector.products] });
      }
    }
  }
  return { sectors: [...sectors.values()] };
}

async function main() {
  if (!BASE) {
    giveUp('no CATALOG_API_URL / VITE_API_URL set');
  }

  // /public/v1 is the contract; /public/catalog is the alias older deployments still serve.
  let path0 = '/public/v1/catalog';
  const pages = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let result = await getJson(`${BASE}${path0}?page=${page}&page_size=${PAGE_SIZE}`);
    if (!result.ok && result.status === 404 && page === 1 && path0 === '/public/v1/catalog') {
      path0 = '/public/catalog';
      result = await getJson(`${BASE}${path0}`);
    }
    if (!result.ok) {
      giveUp(`${BASE}${path0} answered HTTP ${result.status}`);
    }
    const body = result.body;
    if (!body || !Array.isArray(body.sectors)) {
      giveUp(`${BASE}${path0} did not return a catalog (no "sectors")`);
    }
    pages.push(body);
    if (!body.meta || body.meta.has_more !== true) {
      break;
    }
  }

  const catalog = mergePages(pages);
  const total = catalog.sectors.reduce((sum, sector) => sum + sector.products.length, 0);
  if (total === 0) {
    giveUp('the API returned no products');
  }
  fs.writeFileSync(SNAPSHOT, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(
    `snapshot-catalog: wrote ${total} products in ${catalog.sectors.length} sectors from ${BASE}${path0}`,
  );
}

main().catch((error) => giveUp(`${error.name ?? 'Error'}: ${error.message}`));
