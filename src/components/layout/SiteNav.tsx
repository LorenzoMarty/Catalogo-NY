interface SiteNavProps {
  readonly menuOpen: boolean;
  readonly onToggleMenu: () => void;
}

export function SiteNav({ menuOpen, onToggleMenu }: SiteNavProps) {
  return (
    <nav aria-label="Global" className="site-nav">
      <div className="nav-shell">
        <a className="nav-brand" href="#hero">
          <span aria-hidden="true" className="brand-mark">
            <span>NY</span>
          </span>
          <span className="brand-copy">
            <strong>New York Freeshop</strong>
          </span>
        </a>

        <div className="nav-links font-mono">
          <a href="#curation">Curadoria</a>
          <a href="#categories">Categorias</a>
          <a href="#stores">Lojas</a>
        </div>

        <div className="nav-actions">
          <span className="nav-note font-mono">
            inspirado em New York
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
          </span>
          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
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
