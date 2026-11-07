import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  detectLanguage,
  Lang,
  LANG_TAGS,
  readStoredLanguage,
  storeLanguage,
  translate,
  Translate,
} from './core';

interface I18nValue {
  readonly lang: Lang;
  readonly setLang: (lang: Lang) => void;
  readonly t: Translate;
  /** For keys built at runtime (sector ids, store ids): `fallback` is shown when there is no entry. */
  readonly tOr: (key: string, fallback: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const [lang, setLangState] = useState<Lang>(() =>
    detectLanguage(window.location.search, readStoredLanguage(), window.navigator.languages ?? []),
  );

  useEffect(() => {
    document.documentElement.lang = LANG_TAGS[lang];
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    storeLanguage(next);
    setLangState(next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      tOr: (key, fallback, vars) => translate(lang, key, vars, fallback),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider.');
  return context;
}
