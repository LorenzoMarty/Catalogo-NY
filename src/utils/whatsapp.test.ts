import { describe, expect, it } from 'vitest';
import {
  branchNumber,
  productMessage,
  productTargets,
  storeMessage,
  whatsappHref,
} from './whatsapp';

describe('whatsapp', () => {
  it('uses the general number for products when set', () => {
    expect(productTargets({ VITE_WHATSAPP_NUMBER: '+55 55 9999-1111' })).toEqual([
      { id: 'general', label: '', number: '555599991111' },
    ]);
  });

  it('falls back to one target per configured branch', () => {
    const targets = productTargets({ VITE_WHATSAPP_BENTO: '111', VITE_WHATSAPP_MATRIZ: '333' });
    expect(targets.map((t) => t.id)).toEqual(['store-bento', 'store-matriz']);
    expect(productTargets({})).toEqual([]);
  });

  it('resolves a branch number with fallback to the general one', () => {
    const env = { VITE_WHATSAPP_NUMBER: '999', VITE_WHATSAPP_DUQUE: '222' };
    expect(branchNumber('store-duque', env)).toBe('222');
    expect(branchNumber('store-bento', env)).toBe('999');
    expect(branchNumber('store-bento', {})).toBe('');
  });

  it('builds wa.me links with the pre-filled message and product link', () => {
    const text = productMessage({ name: 'Sauvage', brand: 'Dior' }, 'https://x/produto/s-1');
    const href = whatsappHref('55', text);
    expect(href.startsWith('https://wa.me/55?text=')).toBe(true);
    expect(decodeURIComponent(href)).toContain('Sauvage da Dior');
    expect(decodeURIComponent(href)).toContain('https://x/produto/s-1');
    expect(whatsappHref('', 'a')).toBe('https://wa.me?text=a');
    expect(storeMessage({ name: 'Matriz' })).toContain('Matriz');
  });
});
