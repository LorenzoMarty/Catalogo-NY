import { useRef } from 'react';
import logoFull from '../../assets/brand/logo-ny.svg';
import { STORE_PANELS } from '../../data/stores.data';
import { ConsentPreferencesLink } from '../layout/ConsentBanner';
import { useFooterReveal } from '../../hooks/useFooterReveal';
import { resolveAssetPath, resolveSrcSet } from '../../utils/assets';
import { useI18n } from '../../i18n/I18nProvider';

interface FooterCompanyFact {
  readonly label: string;
  readonly value: string;
}

const companyFacts: readonly FooterCompanyFact[] = [
  { label: 'footer.brand', value: 'New York Freeshop' },
  { label: 'CNPJ', value: 'footer.tbd' },
  { label: 'footer.contact', value: 'footer.tbd' },
  { label: 'footer.service', value: 'footer.serviceValue' },
];

export function SiteFooter() {
  const { t, tOr } = useI18n();
  const footerRef = useRef<HTMLElement | null>(null);

  useFooterReveal(footerRef);

  return (
    <footer className="site-footer" id="footer" ref={footerRef}>
      <div aria-hidden="true" className="footer-photo">
        <img
          alt=""
          decoding="async"
          height="538"
          loading="lazy"
          sizes="100vw"
          src={resolveAssetPath('assets/ui/new-york-hero-720.webp')}
          srcSet={resolveSrcSet(
            'assets/ui/new-york-hero-640.webp 640w, assets/ui/new-york-hero-720.webp 720w, assets/ui/new-york-hero-860.webp 860w',
          )}
          width="860"
        />
      </div>
      <div aria-hidden="true" className="footer-grid grid-lines" />
      <div aria-hidden="true" className="footer-veil" />

      <div className="footer-shell">
        <div className="footer-brand-stage">
          <div className="footer-info-column">
            {companyFacts.map((fact) => (
              <article className="footer-info-card" key={fact.label}>
                <span className="footer-info-label font-mono">{tOr(fact.label, fact.label)}</span>
                <p className="footer-info-value">{tOr(fact.value, fact.value)}</p>
              </article>
            ))}
          </div>

          <div className="footer-brand-center">
            <h2 className="footer-title display-font">
              <img
                alt="New York Free Shop"
                className="footer-logo"
                height="392"
                src={logoFull}
                width="380"
              />
            </h2>

            <div className="footer-actions">
              <a className="footer-primary-link display-font" href="#hero">
                {t('footer.backHome')}
              </a>
              <ConsentPreferencesLink />
            </div>
          </div>

          <div className="footer-address-column">
            <span className="footer-address-kicker font-mono">{t('footer.addresses')}</span>

            {STORE_PANELS.map((store) => (
              <article className="footer-address-item" key={store.id}>
                <span className="footer-address-index font-mono">{store.displayIndex}</span>
                <div className="footer-address-copy">
                  <strong>{store.name}</strong>
                  <span>{store.noteLocation}</span>
                  <small>{store.status}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
