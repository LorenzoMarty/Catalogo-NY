export const TRACK_EVENT = 'ny:track';

export type TrackName = 'whatsapp_click' | 'search' | 'open_product' | 'store_click';

/**
 * Conversion events. Fires a `ny:track` window event; whichever analytics provider is wired
 * (see issue #13) listens to it, so call sites do not depend on a vendor.
 */
export function track(name: TrackName, props: Record<string, string> = {}): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: { name, props } }));
}
