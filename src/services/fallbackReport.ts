import type { FallbackReason } from './catalogApi';

export const FALLBACK_EVENT = 'catalog:fallback';

interface ReportEnvironment {
  readonly reportUrl?: string;
  readonly sendBeacon?: (url: string, data?: BodyInit | null) => boolean;
  readonly now?: () => Date;
}

let reported = false;

/** Forgets that a report was already sent (tests only). */
export function resetFallbackReport(): void {
  reported = false;
}

/**
 * Called when the site is showing the bundled catalog because the API failed.
 * Once per page load it warns in the console, fires a `catalog:fallback` window event
 * (analytics can listen to it) and, if VITE_FALLBACK_REPORT_URL is set, sends a small
 * JSON beacon there. The beacon carries no personal data.
 */
export function reportFallback(
  reason: FallbackReason,
  {
    reportUrl = import.meta.env.VITE_FALLBACK_REPORT_URL ?? '',
    sendBeacon = typeof navigator !== 'undefined'
      ? navigator.sendBeacon?.bind(navigator)
      : undefined,
    now = () => new Date(),
  }: ReportEnvironment = {},
): void {
  if (reported) {
    return;
  }
  reported = true;

  console.warn(`[catalog] API unavailable (${reason}); showing the bundled catalog.`);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FALLBACK_EVENT, { detail: { reason } }));
  }

  const url = reportUrl.trim();
  if (url && sendBeacon) {
    const body = JSON.stringify({ event: 'catalog_fallback', reason, at: now().toISOString() });
    sendBeacon(url, new Blob([body], { type: 'application/json' }));
  }
}
