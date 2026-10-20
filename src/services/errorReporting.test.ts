// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const init = vi.fn();
const captureMessage = vi.fn();
vi.mock('@sentry/react', () => ({ init, captureMessage }));

import { initErrorReporting, scrubEvent } from './errorReporting';
import { FALLBACK_EVENT } from './fallbackReport';

const env = (values: Record<string, string>) => values as unknown as ImportMetaEnv;
const DSN = 'https://k@o.ingest.sentry.io/1';

describe('initErrorReporting', () => {
  beforeEach(() => {
    init.mockReset();
    captureMessage.mockReset();
  });

  it('stays off, and loads nothing, without a DSN', async () => {
    expect(await initErrorReporting(env({}))).toBe(false);
    expect(await initErrorReporting(env({ VITE_SENTRY_DSN: '   ' }))).toBe(false);
    expect(init).not.toHaveBeenCalled();
  });

  it('starts Sentry with environment, release and PII scrubbing', async () => {
    const started = await initErrorReporting(
      env({ VITE_SENTRY_DSN: DSN, MODE: 'production', VITE_SENTRY_RELEASE: 'abc123' }),
    );

    expect(started).toBe(true);
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: DSN,
        environment: 'production',
        release: 'abc123',
        beforeSend: scrubEvent,
      }),
    );
  });

  it('reports the API fallback event as a warning', async () => {
    await initErrorReporting(env({ VITE_SENTRY_DSN: DSN, MODE: 'production' }));
    window.dispatchEvent(new CustomEvent(FALLBACK_EVENT, { detail: { reason: 'network' } }));
    expect(captureMessage).toHaveBeenCalledWith('catalog_fallback', {
      level: 'warning',
      tags: { reason: 'network' },
    });
  });
});

describe('scrubEvent', () => {
  it('removes user, cookies, headers and the query string', () => {
    const event = scrubEvent({
      type: undefined,
      user: { email: 'a@b.c' },
      request: { url: 'https://x.com/p?phone=1#h', cookies: { a: 'b' }, headers: { c: 'd' } },
    });
    expect(event.user).toBeUndefined();
    expect(event.request).toEqual({ url: 'https://x.com/p' });
  });
});
