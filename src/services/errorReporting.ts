import type { ErrorEvent } from '@sentry/react';
import { FALLBACK_EVENT } from './fallbackReport';

/** Drops anything that could identify a visitor: user, cookies, headers, query strings. */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  delete event.user;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.query_string;
    if (event.request.url) {
      event.request.url = event.request.url.split(/[?#]/)[0];
    }
  }
  return event;
}

/**
 * Browser error reporting to Sentry, off unless VITE_SENTRY_DSN is set (then nothing is
 * loaded and nothing is sent). The SDK is imported on demand to keep it out of the main
 * bundle. Unhandled errors and rejections are captured by the SDK's global handlers; the
 * API-fallback event (#23) is reported as a warning.
 */
export async function initErrorReporting(env: ImportMetaEnv = import.meta.env): Promise<boolean> {
  const dsn = (env.VITE_SENTRY_DSN ?? '').trim();
  if (!dsn) {
    return false;
  }

  const Sentry = await import('@sentry/react');
  Sentry.init({
    dsn,
    environment: env.MODE,
    release: env.VITE_SENTRY_RELEASE || undefined,
    tracesSampleRate: 0,
    beforeSend: scrubEvent,
  });

  window.addEventListener(FALLBACK_EVENT, (e) => {
    const reason = (e as CustomEvent<{ reason: string }>).detail?.reason;
    Sentry.captureMessage('catalog_fallback', { level: 'warning', tags: { reason } });
  });
  return true;
}
