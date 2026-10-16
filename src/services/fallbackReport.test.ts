// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchRemoteCatalog, type FallbackReason } from './catalogApi';
import { FALLBACK_EVENT, reportFallback, resetFallbackReport } from './fallbackReport';

const response = (body: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => body }) as Response;

async function failureOf(fetchImpl: typeof fetch, timeoutMs?: number) {
  const reasons: FallbackReason[] = [];
  const result = await fetchRemoteCatalog('http://api.test', {
    fetchImpl,
    timeoutMs,
    onFailure: (reason) => reasons.push(reason),
  });
  return { result, reasons };
}

describe('fetchRemoteCatalog failure reasons', () => {
  it('reports http for a non-2xx answer', async () => {
    const { result, reasons } = await failureOf(async () => response({}, false, 503));
    expect(result).toBeNull();
    expect(reasons).toEqual(['http']);
  });

  it('reports invalid for a body that does not parse as the contract', async () => {
    const { reasons } = await failureOf(async () => response({ nope: true }));
    expect(reasons).toEqual(['invalid']);
  });

  it('reports network when the request throws', async () => {
    const { reasons } = await failureOf(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(reasons).toEqual(['network']);
  });

  it('reports timeout when the API is slower than the limit', async () => {
    const slow = ((_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('x', 'AbortError')));
      })) as unknown as typeof fetch;
    const { reasons } = await failureOf(slow, 20);
    expect(reasons).toEqual(['timeout']);
  });

  it('stays quiet when no API is configured and when it works', async () => {
    const reasons: FallbackReason[] = [];
    await fetchRemoteCatalog('', { onFailure: (r) => reasons.push(r) });
    await fetchRemoteCatalog('http://api.test', {
      fetchImpl: async () => response({ sectors: [] }),
      onFailure: (r) => reasons.push(r),
    });
    expect(reasons).toEqual([]);
  });
});

describe('reportFallback', () => {
  beforeEach(() => {
    resetFallbackReport();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  it('fires a window event and warns, once per page load', () => {
    const seen: unknown[] = [];
    const listener = (event: Event) => seen.push((event as CustomEvent).detail);
    window.addEventListener(FALLBACK_EVENT, listener);

    reportFallback('timeout', { reportUrl: '' });
    reportFallback('http', { reportUrl: '' });

    window.removeEventListener(FALLBACK_EVENT, listener);
    expect(seen).toEqual([{ reason: 'timeout' }]);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('sends a JSON beacon with the reason and the time when a report URL is set', async () => {
    const sendBeacon = vi.fn(() => true);

    reportFallback('network', {
      reportUrl: ' https://alerts.example.com/hook ',
      sendBeacon,
      now: () => new Date('2026-10-16T12:00:00Z'),
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, blob] = sendBeacon.mock.calls[0] as unknown as [string, Blob];
    expect(url).toBe('https://alerts.example.com/hook');
    expect(JSON.parse(await blob.text())).toEqual({
      event: 'catalog_fallback',
      reason: 'network',
      at: '2026-10-16T12:00:00.000Z',
    });
  });

  it('does not send a beacon without a report URL', () => {
    const sendBeacon = vi.fn(() => true);
    reportFallback('http', { reportUrl: '', sendBeacon });
    expect(sendBeacon).not.toHaveBeenCalled();
  });
});
