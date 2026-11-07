/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER?: string;
  /** Per-branch numbers; a branch without one uses VITE_WHATSAPP_NUMBER. */
  readonly VITE_WHATSAPP_BENTO?: string;
  readonly VITE_WHATSAPP_DUQUE?: string;
  readonly VITE_WHATSAPP_MATRIZ?: string;
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_PLAUSIBLE_HOST?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_FALLBACK_REPORT_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_RELEASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
