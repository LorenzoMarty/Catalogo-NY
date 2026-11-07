// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { resetAnalytics, startAnalytics } from './analytics';
import { track } from './track';

const env = (values: Record<string, string>) => values as unknown as ImportMetaEnv;

describe('startAnalytics', () => {
  beforeEach(() => {
    resetAnalytics();
    document.head.innerHTML = '';
    delete window.plausible;
  });

  it('loads nothing without a domain', () => {
    expect(startAnalytics(env({}))).toBe(false);
    expect(document.head.querySelector('script')).toBeNull();
  });

  it('injects the script once and queues track events for Plausible', () => {
    expect(startAnalytics(env({ VITE_PLAUSIBLE_DOMAIN: 'ny.example' }))).toBe(true);
    expect(startAnalytics(env({ VITE_PLAUSIBLE_DOMAIN: 'ny.example' }))).toBe(false);

    const script = document.head.querySelector('script')!;
    expect(script.src).toBe('https://plausible.io/js/script.js');
    expect(script.dataset.domain).toBe('ny.example');

    track('whatsapp_click', { product: '1' });
    expect(window.plausible?.q).toEqual([['whatsapp_click', { props: { product: '1' } }]]);
  });

  it('supports a self-hosted host', () => {
    startAnalytics(env({ VITE_PLAUSIBLE_DOMAIN: 'd', VITE_PLAUSIBLE_HOST: 'https://stats.x/' }));
    expect(document.head.querySelector('script')!.src).toBe('https://stats.x/js/script.js');
  });
});
