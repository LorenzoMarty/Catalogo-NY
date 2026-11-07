import { defineConfig } from '@playwright/test';

// E2E_BASE_URL points the suite at a deployed site (e.g. the Vercel preview). Without it, the
// suite serves the local production build (`npm run build` first) with `vite preview`.
const baseURL = process.env.E2E_BASE_URL;
// Needed when the Vercel preview is behind Deployment Protection (repo secret of the same name).
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: baseURL ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    extraHTTPHeaders: bypass ? { 'x-vercel-protection-bypass': bypass } : undefined,
  },
  webServer: baseURL
    ? undefined
    : { command: 'npx vite preview', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
});
