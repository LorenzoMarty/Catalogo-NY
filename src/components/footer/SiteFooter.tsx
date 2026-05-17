import { useRef } from 'react';
import { STORE_PANELS } from '../../data/stores.data';
import { useFooterReveal } from '../../hooks/useFooterReveal';
import { resolveAssetPath, resolveSrcSet } from '../../utils/assets';

interface FooterCompanyFact {
  readonly label: string;
  readonly value: string;
}

const companyFacts: readonly FooterCompanyFact[] = [
  { label: 'Marca', value: 'New York Freeshop' },
  { label: 'CNPJ', value: 'A informar' },
  { label: 'Contato', value: 'A informar' },
  { label: 'Atendimento', value: 'Centro de Uruguaiana - RS' },
];

export function SiteFooter() {
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
                <span className="footer-info-label font-mono">{fact.label}</span>
                <p className="footer-info-value">{fact.value}</p>
              </article>
            ))}
          </div>

          <div className="footer-brand-center">
            <h2 className="footer-title display-font">New York Freeshop</h2>

            <div className="footer-actions">
              <a className="footer-primary-link display-font" href="#hero">
                Voltar ao inicio
              </a>
            </div>
          </div>

          <div className="footer-address-column">
            <span className="footer-address-kicker font-mono">Enderecos oficiais</span>

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
