import Lenis from 'lenis';
import { useEffect } from 'react';

interface NetworkConnectionLike {
  readonly effectiveType?: string;
  readonly saveData?: boolean;
}

interface ExtendedNavigator extends Navigator {
  readonly connection?: NetworkConnectionLike;
  readonly mozConnection?: NetworkConnectionLike;
  readonly webkitConnection?: NetworkConnectionLike;
}

export function useLenisSmoothScroll(): void {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const navigatorRef = window.navigator as ExtendedNavigator;
    const connection =
      navigatorRef.connection ??
      navigatorRef.mozConnection ??
      navigatorRef.webkitConnection ??
      null;
    const effectiveType = connection?.effectiveType ?? '';
    const shouldConserveData =
      Boolean(connection?.saveData) || /^slow-?2g$|^2g$/.test(effectiveType);

    if (reduceMotion.matches || shouldConserveData) {
      return undefined;
    }

    const lenis = new Lenis({
      anchors: false,
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
    });

    let frame = 0;

    const raf = (time: number): void => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    const handleAnchorClick = (event: MouseEvent): void => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
          : null;

      if (!target) {
        return;
      }

      const hash = target.getAttribute('href');

      if (!hash || hash === '#') {
        return;
      }

      const element = document.querySelector(hash);

      if (!(element instanceof HTMLElement)) {
        return;
      }

      event.preventDefault();
      lenis.scrollTo(element, {
        offset: -18,
        duration: 1.05,
        easing: (value) => 1 - Math.pow(1 - value, 3),
      });
      window.history.replaceState(null, '', hash);
    };

    frame = window.requestAnimationFrame(raf);
    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}
