import { useCallback, useEffect, useState } from 'react';
import { useBodyClass } from './useBodyClass';

export function useMobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  useBodyClass('menu-open', menuOpen);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((isOpen) => !isOpen);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    closeMenu,
    menuOpen,
    toggleMenu,
  };
}
