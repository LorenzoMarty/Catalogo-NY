import { describe, expect, it } from 'vitest';
import { detectLanguage, languageFromNavigator, translate } from './core';
import { en } from './en';
import { es } from './es';
import { pt } from './pt';

describe('translate', () => {
  it('returns the text of the language with placeholders filled', () => {
    expect(translate('en', 'search.count', { n: 2, total: 9 })).toBe('2 of 9 results');
    expect(translate('es', 'catalog.selectSector', { name: 'Bebidas' })).toBe(
      'Seleccionar Bebidas',
    );
  });

  it('falls back to Portuguese when a language lacks the key', () => {
    const partial = { pt: { a: 'olá' }, es: {}, en: {} };
    expect(translate('en', 'a', undefined, undefined, partial)).toBe('olá');
  });

  it('falls back to the given text, then to the key, for unknown keys', () => {
    expect(translate('es', 'sector.unknown', undefined, 'Perfumes')).toBe('Perfumes');
    expect(translate('es', 'nope')).toBe('nope');
  });

  it('has every Portuguese key in Spanish and English, with the same placeholders', () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join();
    for (const key of Object.keys(pt) as (keyof typeof pt)[]) {
      expect(es[key], `es.${key}`).toBeTruthy();
      expect(en[key], `en.${key}`).toBeTruthy();
      expect(placeholders(es[key]), `es.${key}`).toBe(placeholders(pt[key]));
      expect(placeholders(en[key]), `en.${key}`).toBe(placeholders(pt[key]));
    }
  });
});

describe('language detection', () => {
  it('picks the first supported browser language', () => {
    expect(languageFromNavigator(['fr-FR', 'es-UY', 'en'])).toBe('es');
    expect(languageFromNavigator(['de'])).toBe('pt');
  });

  it('prefers the URL, then the saved choice, then the browser', () => {
    expect(detectLanguage('?lang=en', 'es', ['pt-BR'])).toBe('en');
    expect(detectLanguage('', 'es', ['en'])).toBe('es');
    expect(detectLanguage('?lang=xx', 'zz', ['en-US'])).toBe('en');
  });
});
