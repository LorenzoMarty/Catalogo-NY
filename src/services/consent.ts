export type Consent = 'granted' | 'denied';

const KEY = 'ny:consent';
export const CONSENT_RESET_EVENT = 'ny:consent-reset';

export function getConsent(
  storage: Pick<Storage, 'getItem'> | null = safeStorage(),
): Consent | null {
  try {
    const value = storage?.getItem(KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(
  value: Consent | null,
  storage: Pick<Storage, 'setItem' | 'removeItem'> | null = safeStorage(),
): void {
  try {
    if (value) storage?.setItem(KEY, value);
    else storage?.removeItem(KEY);
  } catch {
    // Storage blocked: the choice just is not remembered (banner shows again next visit).
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
