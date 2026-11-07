import { useI18n } from '../../i18n/I18nProvider';
import { LANG_LABELS, LANGS } from '../../i18n/core';

/** PT / ES / EN toggle; the choice is saved and reflected in <html lang>. */
export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <div aria-label={t('nav.language')} className="lang-switcher font-mono" role="group">
      {LANGS.map((code) => (
        <button
          aria-pressed={lang === code}
          className={lang === code ? 'is-active' : undefined}
          key={code}
          onClick={() => setLang(code)}
          type="button"
        >
          {LANG_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
