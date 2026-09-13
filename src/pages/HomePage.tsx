import { lazy, Suspense } from 'react';
import { CatalogSection } from '../components/catalog/CatalogSection';
import { HeroSection } from '../components/hero/HeroSection';
import { HeroTicker } from '../components/hero/HeroTicker';
import { MobileMenu } from '../components/layout/MobileMenu';
import { SiteNav } from '../components/layout/SiteNav';
import { CatalogProvider } from '../context/CatalogContext';
import { useMobileMenu } from '../hooks/useMobileMenu';

const StoresSection = lazy(() =>
  import('../components/stores/StoresSection').then((module) => ({
    default: module.StoresSection,
  })),
);
const SiteFooter = lazy(() =>
  import('../components/footer/SiteFooter').then((module) => ({
    default: module.SiteFooter,
  })),
);

export function HomePage() {
  const { closeMenu, menuOpen, toggleMenu } = useMobileMenu();

  return (
    <>
      <div aria-hidden="true" className="noise" />

      <MobileMenu onNavigate={closeMenu} open={menuOpen} />
      <SiteNav menuOpen={menuOpen} onToggleMenu={toggleMenu} />

      <div className="wrapper">
        <HeroSection />
        <HeroTicker />
        <CatalogProvider>
          <CatalogSection />
        </CatalogProvider>
      </div>

      <Suspense fallback={<div className="section-lazy-shell" aria-hidden="true" />}>
        <StoresSection />
        <SiteFooter />
      </Suspense>
    </>
  );
}
