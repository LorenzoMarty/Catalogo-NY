import { RefObject, useLayoutEffect } from 'react';

interface NetworkConnectionLike {
  readonly effectiveType?: string;
  readonly saveData?: boolean;
}

interface ExtendedNavigator extends Navigator {
  readonly connection?: NetworkConnectionLike;
  readonly mozConnection?: NetworkConnectionLike;
  readonly webkitConnection?: NetworkConnectionLike;
}

export function useHeroParallax(
  heroStageRef: RefObject<HTMLElement | null>,
  heroMediaRef: RefObject<HTMLImageElement | null>,
): void {
  useLayoutEffect(() => {
    const heroStage = heroStageRef.current;
    const heroMedia = heroMediaRef.current;

    if (!heroStage || !heroMedia) {
      return undefined;
    }

    const cleanups: Array<() => void> = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wideMotion = window.matchMedia('(min-width: 768px)');
    const navigatorRef = window.navigator as ExtendedNavigator;
    const connection =
      navigatorRef.connection ??
      navigatorRef.mozConnection ??
      navigatorRef.webkitConnection ??
      null;

    let heroVisible = true;
    let frameId = 0;

    const shouldConserveData = (): boolean => {
      const effectiveType = connection?.effectiveType ?? '';
      return Boolean(connection?.saveData) || /^slow-?2g$|^2g$/.test(effectiveType);
    };

    const resetHeroParallax = (): void => {
      heroMedia.style.removeProperty('--hero-media-y');
      heroMedia.style.removeProperty('--hero-media-scale');
    };

    const canAnimateHero = (): boolean =>
      heroVisible && wideMotion.matches && !reduceMotion.matches && !shouldConserveData();

    const updateHeroParallax = (): void => {
      if (!canAnimateHero()) {
        resetHeroParallax();
        return;
      }

      const rect = heroStage.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const range = Math.max(rect.height, viewportHeight, 1);
      const traveled = Math.min(Math.max(-rect.top, 0), range);
      const progress = traveled / range;
      const translateY = progress * 34;
      const scale = 1.08 + progress * 0.04;

      heroMedia.style.setProperty('--hero-media-y', `${translateY.toFixed(2)}px`);
      heroMedia.style.setProperty('--hero-media-scale', scale.toFixed(4));
    };

    const scheduleHeroParallax = (): void => {
      if (!canAnimateHero()) {
        resetHeroParallax();
        return;
      }

      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateHeroParallax();
      });
    };

    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          heroVisible = entries.some(
            (entry) => entry.isIntersecting || entry.intersectionRatio > 0,
          );

          if (heroVisible) {
            scheduleHeroParallax();
            return;
          }

          resetHeroParallax();
        },
        {
          rootMargin: '220px 0px',
        },
      );

      heroObserver.observe(heroStage);
      cleanups.push(() => heroObserver.disconnect());
    }

    const handleViewportChange = (): void => {
      scheduleHeroParallax();
    };

    updateHeroParallax();
    window.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', handleViewportChange));
    cleanups.push(() => window.removeEventListener('resize', handleViewportChange));
    listenToMediaQuery(reduceMotion, handleViewportChange, cleanups);
    listenToMediaQuery(wideMotion, handleViewportChange, cleanups);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      resetHeroParallax();
    };
  }, [heroMediaRef, heroStageRef]);
}

function listenToMediaQuery(
  query: MediaQueryList,
  handler: (event?: MediaQueryListEvent) => void,
  cleanups: Array<() => void>,
): void {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handler);
    cleanups.push(() => query.removeEventListener('change', handler));
    return;
  }

  query.addListener(handler);
  cleanups.push(() => query.removeListener(handler));
}
