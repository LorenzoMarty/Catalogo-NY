interface MobileMenuProps {
  readonly onNavigate: () => void;
}

const mobileLinks = [
  { href: '#hero', index: '01', label: 'Inicio', note: '#hero' },
  { href: '#curation', index: '02', label: 'Curadoria', note: '#curation' },
  { href: '#categories', index: '03', label: 'Categorias', note: '#categories' },
  { href: '#stores', index: '04', label: 'Lojas', note: '#stores' },
];

export function MobileMenu({ onNavigate }: MobileMenuProps) {
  return (
    <div aria-hidden="true" id="mobile-menu">
      <div className="mobile-menu-shell">
        <div className="mobile-menu-head">
          <span className="mobile-menu-kicker">Dobras</span>
          <p className="mobile-menu-city">4 caminhos</p>
        </div>

        <nav aria-label="Mobile" className="mobile-menu-nav">
          {mobileLinks.map((link) => (
            <a className="mobile-menu-link" href={link.href} key={link.href} onClick={onNavigate}>
              <span className="mobile-link-index">{link.index}</span>
              <span className="mobile-link-copy">
                <span className="mobile-link-label">{link.label}</span>
                <span className="mobile-link-note">{link.note}</span>
              </span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
