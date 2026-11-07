import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

const release = process.env.VITE_SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA ?? '';

export default defineConfig({
  plugins: [
    react(),
    // Uploads source maps to Sentry, only when SENTRY_AUTH_TOKEN is set (e.g. Vercel production
    // env); local and PR builds skip it. The maps are removed from dist/ after upload.
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            release: { name: release || undefined },
            sourcemaps: { filesToDeleteAfterUpload: ['dist/**/*.map'] },
            telemetry: false,
          }),
        ]
      : []),
  ],
  define: {
    // Release tag: explicit override, else the commit Vercel is building.
    'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(release),
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
