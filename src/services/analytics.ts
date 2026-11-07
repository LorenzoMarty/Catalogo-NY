import { TRACK_EVENT } from './track';

type Plausible = ((name: string, options?: { props: Record<string, string> }) => void) & {
  q?: unknown[];
};

declare global {
  interface Window {
    plausible?: Plausible;
  }
}

let started = false;

/** True when an analytics provider is configured (Plausible domain set). */
export const analyticsConfigured = (env: ImportMetaEnv = import.meta.env): boolean =>
  Boolean((env.VITE_PLAUSIBLE_DOMAIN ?? '').trim());

/**
 * Privacy-friendly analytics with Plausible (no cookies, no personal data; ADR in issue #13).
 * Off unless VITE_PLAUSIBLE_DOMAIN is set; nothing is loaded or requested before this is called.
 * It injects the script (pageviews, SPA navigation and UTM attribution are handled by Plausible
 * itself) and forwards the site's `ny:track` events as Plausible custom events.
 * Returns whether it started.
 */
export function startAnalytics(env: ImportMetaEnv = import.meta.env): boolean {
  const domain = (env.VITE_PLAUSIBLE_DOMAIN ?? '').trim();
  if (!domain || started) return false;
  started = true;

  // Official queue stub: events sent before the script has loaded are replayed by it.
  window.plausible =
    window.plausible ??
    Object.assign((...args: unknown[]) => {
      (window.plausible!.q = window.plausible!.q ?? []).push(args);
    }, {});

  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = domain;
  script.src = `${(env.VITE_PLAUSIBLE_HOST || 'https://plausible.io').replace(/\/+$/, '')}/js/script.js`;
  document.head.appendChild(script);

  window.addEventListener(TRACK_EVENT, (event) => {
    const { name, props } = (event as CustomEvent<{ name: string; props: Record<string, string> }>)
      .detail;
    window.plausible?.(name, { props });
  });
  return true;
}

/** Forgets that analytics started (tests only). */
export function resetAnalytics(): void {
  started = false;
}
