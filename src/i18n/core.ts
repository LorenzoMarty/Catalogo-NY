import { en } from './en';
import { es } from './es';
import { MessageKey, pt } from './pt';

export const LANGS = ['pt', 'es', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'pt';
export const LANG_LABELS: Record<Lang, string> = { pt: 'PT', es: 'ES', en: 'EN' };
/** BCP 47 tags for <html lang> and hreflang. */
export const LANG_TAGS: Record<Lang, string> = { pt: 'pt-BR', es: 'es', en: 'en' };

type Dictionary = Partial<Record<string, string>>;
const dictionaries: Record<Lang, Dictionary> = { pt, es, en };

export const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

/**
 * Looks a key up in `lang`, then in Portuguese, then returns `fallback` (default: the key).
 * `{name}` placeholders are filled from `vars`.
 */
export function translate(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>,
  fallback?: string,
  dictionaryOverride?: Record<Lang, Dictionary>,
): string {
  const source = dictionaryOverride ?? dictionaries;
  const text = source[lang][key] ?? source[DEFAULT_LANG][key] ?? fallback ?? key;
  return vars ? text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`)) : text;
}

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

/** First supported language among the browser's preferences, else Portuguese. */
export function languageFromNavigator(languages: readonly string[]): Lang {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}

const STORAGE_KEY = 'ny:lang';

/** URL `?lang=` wins (it is what hreflang links point to), then the saved choice, then the browser. */
export function detectLanguage(
  search: string,
  stored: string | null,
  languages: readonly string[],
): Lang {
  const fromUrl = new URLSearchParams(search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  if (isLang(stored)) return stored;
  return languageFromNavigator(languages);
}

export function readStoredLanguage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeLanguage(lang: Lang): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not remembered; the browser language is used next time.
  }
}

const plain = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** Translates a sector name that only exists as text (search suggestions) by matching the pt name. */
export function translateSectorName(lang: Lang, name: string): string {
  const entry = Object.entries(pt).find(
    ([key, value]) => key.startsWith('sector.') && plain(value) === plain(name),
  );
  return entry ? translate(lang, entry[0]) : name;
}
