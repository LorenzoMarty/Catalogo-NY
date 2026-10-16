// @vitest-environment node
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CATALOG_SECTORS } from '../data/catalog.data';
import { parseRemoteCatalog, RemoteCatalog, toCatalogData } from './catalogApi';
import { pickBundledCatalog } from './catalogService';

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'snapshot-catalog.cjs');
const SEED = '{\n  "sectors": []\n}\n';

const product = (id: number, name: string) => ({
  id,
  brand: 'Marca',
  name,
  description: '',
  price_usd: '10.00',
  price_is_from: false,
  featured: id === 1,
  image_url: null,
  in_stock: true,
});

type Handler = (url: URL) => { status: number; body?: unknown };

let server: http.Server;
let handler: Handler;
let dir: string;
let snapshot: string;
let baseUrl: string;
let requested: string[];

function exec(args: string[], env: Record<string, string>) {
  // async on purpose: a sync spawn would block the event loop that serves the mock API
  return new Promise<{ code: number | null; out: string }>((resolve) => {
    execFile(
      process.execPath,
      [SCRIPT, ...args],
      { env: { ...process.env, ...env }, encoding: 'utf8' },
      (error, stdout, stderr) =>
        resolve({
          code: error ? ((error as { code?: number }).code ?? 1) : 0,
          out: `${stdout}${stderr}`,
        }),
    );
  });
}

function run(args: string[] = [], url: string = baseUrl) {
  return exec(args, {
    CATALOG_API_URL: url,
    CATALOG_SNAPSHOT_PATH: snapshot,
    CATALOG_API_TIMEOUT_MS: '3000',
  });
}

beforeEach(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-'));
  snapshot = path.join(dir, 'catalog-snapshot.json');
  fs.writeFileSync(snapshot, SEED);
  requested = [];
  server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://x');
    requested.push(url.pathname + url.search);
    const { status, body } = handler(url);
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(body === undefined ? '' : JSON.stringify(body));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('scripts/snapshot-catalog.cjs', () => {
  it('writes the catalog the API serves, following pages and merging sectors', async () => {
    handler = (url) => {
      const page = Number(url.searchParams.get('page'));
      return page === 1
        ? {
            status: 200,
            body: {
              sectors: [{ name: 'Perfumaria', products: [product(1, 'A')] }],
              meta: { has_more: true },
            },
          }
        : {
            status: 200,
            body: {
              sectors: [
                { name: 'Perfumaria', products: [product(2, 'B')] },
                { name: 'Bebidas', products: [product(3, 'C')] },
              ],
              meta: { has_more: false },
            },
          };
    };

    const { code, out } = await run();

    expect(code).toBe(0);
    expect(out).toContain('wrote 3 products in 2 sectors');
    const written = JSON.parse(fs.readFileSync(snapshot, 'utf8')) as RemoteCatalog;
    expect(written.sectors.map((s) => [s.name, s.products.map((p) => p.name)])).toEqual([
      ['Perfumaria', ['A', 'B']],
      ['Bebidas', ['C']],
    ]);
    expect(requested).toEqual([
      '/public/v1/catalog?page=1&page_size=500',
      '/public/v1/catalog?page=2&page_size=500',
    ]);
  });

  it('makes the bundled fallback equal to what the API served', async () => {
    const payload = { sectors: [{ name: 'Perfumaria', products: [product(1, 'A')] }] };
    handler = () => ({ status: 200, body: payload });

    await run();

    const written = JSON.parse(fs.readFileSync(snapshot, 'utf8')) as RemoteCatalog;
    expect(pickBundledCatalog(written)).toEqual(toCatalogData(parseRemoteCatalog(payload)!));
  });

  it('uses the legacy path when the deployed API has no /public/v1 yet', async () => {
    handler = (url) =>
      url.pathname === '/public/catalog'
        ? { status: 200, body: { sectors: [{ name: 'X', products: [product(1, 'A')] }] } }
        : { status: 404 };

    const { code } = await run();

    expect(code).toBe(0);
    expect(requested).toEqual(['/public/v1/catalog?page=1&page_size=500', '/public/catalog']);
    expect(JSON.parse(fs.readFileSync(snapshot, 'utf8')).sectors).toHaveLength(1);
  });

  it('keeps the committed seed and still succeeds when the API is down', async () => {
    const { code, out } = await run([], 'http://127.0.0.1:1');

    expect(code).toBe(0);
    expect(out).toContain('keeping');
    expect(fs.readFileSync(snapshot, 'utf8')).toBe(SEED);
  });

  it.each([
    ['answers 500', () => ({ status: 500 })],
    ['returns something that is not a catalog', () => ({ status: 200, body: { hello: 1 } })],
    ['returns no products', () => ({ status: 200, body: { sectors: [] } })],
  ] as [string, Handler][])('keeps the seed when the API %s', async (_name, h) => {
    handler = h;

    const { code } = await run();

    expect(code).toBe(0);
    expect(fs.readFileSync(snapshot, 'utf8')).toBe(SEED);
  });

  it('fails with --require when the API cannot provide the catalog', async () => {
    expect((await run(['--require'], 'http://127.0.0.1:1')).code).toBe(1);
  });

  it('does nothing without an API URL', async () => {
    const { code } = await exec([], {
      CATALOG_API_URL: '',
      VITE_API_URL: '',
      CATALOG_SNAPSHOT_PATH: snapshot,
    });
    expect(code).toBe(0);
    expect(fs.readFileSync(snapshot, 'utf8')).toBe(SEED);
  });
});

describe('pickBundledCatalog', () => {
  it('uses the hand-made catalog while the snapshot is the empty seed', async () => {
    const catalog = pickBundledCatalog({ sectors: [] });
    expect(catalog.sectors).toBe(CATALOG_SECTORS);
  });

  it('uses the snapshot as soon as it has products', async () => {
    const catalog = pickBundledCatalog({
      sectors: [{ name: 'Perfumaria', products: [product(1, 'A')] }],
    } as unknown as RemoteCatalog);
    expect(catalog.sectors.flatMap((s) => s.products.map((p) => p.id))).toEqual(['1']);
  });
});
