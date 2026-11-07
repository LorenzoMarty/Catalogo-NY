import logoMark from '../../assets/brand/logo-ny-mark.svg';
import { useI18n } from '../../i18n/I18nProvider';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SiteNavProps {
  readonly menuOpen: boolean;
  readonly onToggleMenu: () => void;
}

export function SiteNav({ menuOpen, onToggleMenu }: SiteNavProps) {
  const { t } = useI18n();
  return (
    <nav aria-label="Global" className="site-nav">
      <div className="nav-shell">
        <a className="nav-brand" href="#hero">
          <img alt="" className="brand-logo" height="40" src={logoMark} width="28" />
          <span className="brand-copy">
            <strong>New York Freeshop</strong>
          </span>
        </a>

        <div className="nav-links font-mono">
          <a href="#hero">{t('nav.home')}</a>
          <a href="#categories">{t('nav.categories')}</a>
          <a href="#stores">{t('nav.stores')}</a>
          <a href="#footer">{t('nav.contact')}</a>
        </div>

        <div className="nav-actions">
          <LanguageSwitcher />
          <a className="nav-note font-mono" href="#footer">
            {t('nav.talk')}
            <svg
              aria-hidden="true"
              className="nav-note-icon"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            className="menu-toggle"
            id="menu-btn"
            onClick={onToggleMenu}
            type="button"
          >
            <span className={`menu-icon${menuOpen ? ' is-hidden' : ''}`} id="icon-menu">
              <svg
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 12h16" />
                <path d="M4 6h16" />
                <path d="M4 18h16" />
              </svg>
            </span>
            <span className={`menu-icon${menuOpen ? '' : ' is-hidden'}`} id="icon-close">
              <svg
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
