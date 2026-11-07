import { useI18n } from '../../i18n/I18nProvider';
import type { MessageKey } from '../../i18n/pt';

interface MobileMenuProps {
  readonly open: boolean;
  readonly onNavigate: () => void;
}

const mobileLinks: readonly { href: string; index: string; label: MessageKey; note: string }[] = [
  { href: '#hero', index: '01', label: 'nav.home', note: '#hero' },
  { href: '#curation', index: '02', label: 'nav.curation', note: '#curation' },
  { href: '#categories', index: '03', label: 'nav.categories', note: '#categories' },
  { href: '#stores', index: '04', label: 'nav.stores', note: '#stores' },
];

export function MobileMenu({ onNavigate, open }: MobileMenuProps) {
  const { t } = useI18n();
  return (
    <div id="mobile-menu" inert={!open}>
      <div className="mobile-menu-shell">
        <div className="mobile-menu-head">
          <span className="mobile-menu-kicker">{t('menu.kicker')}</span>
          <p className="mobile-menu-city">{t('menu.paths')}</p>
        </div>

        <nav aria-label="Mobile" className="mobile-menu-nav">
          {mobileLinks.map((link) => (
            <a className="mobile-menu-link" href={link.href} key={link.href} onClick={onNavigate}>
              <span className="mobile-link-index">{link.index}</span>
              <span className="mobile-link-copy">
                <span className="mobile-link-label">{t(link.label)}</span>
                <span className="mobile-link-note">{link.note}</span>
              </span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
