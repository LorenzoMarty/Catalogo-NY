/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_FALLBACK_REPORT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
