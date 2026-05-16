import { CatalogSection } from '../components/catalog/CatalogSection';
import { SiteFooter } from '../components/footer/SiteFooter';
import { HeroSection } from '../components/hero/HeroSection';
import { HeroTicker } from '../components/hero/HeroTicker';
import { MobileMenu } from '../components/layout/MobileMenu';
import { SiteNav } from '../components/layout/SiteNav';
import { StoresSection } from '../components/stores/StoresSection';
import { CatalogProvider } from '../context/CatalogContext';
import { useMobileMenu } from '../hooks/useMobileMenu';

export function HomePage() {
  const { closeMenu, menuOpen, toggleMenu } = useMobileMenu();

  return (
    <>
      <div aria-hidden="true" className="noise" />

      <MobileMenu onNavigate={closeMenu} />
      <SiteNav menuOpen={menuOpen} onToggleMenu={toggleMenu} />

      <div className="wrapper">
        <HeroSection />
        <HeroTicker />
        <CatalogProvider>
          <CatalogSection />
        </CatalogProvider>
      </div>

      <StoresSection />
      <SiteFooter />
    </>
  );
}
