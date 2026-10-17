// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetFallbackReport } from '../services/fallbackReport';
import { CatalogProvider, useCatalog } from './CatalogContext';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Probe() {
  const { source } = useCatalog();
  return <p data-testid="source">{source}</p>;
}

let host: HTMLDivElement;
let root: Root;

async function mount(apiBaseUrl: string) {
  await act(async () => {
    root.render(
      <CatalogProvider apiBaseUrl={apiBaseUrl}>
        <Probe />
      </CatalogProvider>,
    );
  });
  // let the pending fetch settle
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return host.querySelector('[data-testid="source"]')!.textContent;
}

describe('CatalogProvider source', () => {
  beforeEach(() => {
    resetFallbackReport();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });
  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is "static" with no API configured, and never calls the network', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    expect(await mount('')).toBe('static');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('is "api" once the feed answers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ sectors: [] }) })),
    );

    expect(await mount('http://api.test')).toBe('api');
  });

  it('is "fallback" when the API fails, and reports it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })),
    );
    const heard = vi.fn();
    window.addEventListener('catalog:fallback', heard);

    expect(await mount('http://api.test')).toBe('fallback');

    window.removeEventListener('catalog:fallback', heard);
    expect(heard).toHaveBeenCalledTimes(1);
  });

  it('is "fallback" when the request throws (API down)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    expect(await mount('http://api.test')).toBe('fallback');
  });
});
