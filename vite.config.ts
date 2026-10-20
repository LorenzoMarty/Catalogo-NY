import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  define: {
    // Release tag: explicit override, else the commit Vercel is building.
    'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(
      process.env.VITE_SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA ?? '',
    ),
  },
  build: {
    // Maps are generated for Sentry but not referenced from the bundles.
    sourcemap: 'hidden',
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
});
