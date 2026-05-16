import { RefObject, useEffect } from 'react';

export function useFooterReveal(footerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const footer = footerRef.current;

    if (!footer) {
      return undefined;
    }

    const cleanups: Array<() => void> = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealFooter = (): void => {
      footer.classList.add('is-visible');
    };

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealFooter();
      return () => {
        footer.classList.remove('is-visible');
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const shouldReveal = entries.some(
          (entry) => entry.isIntersecting || entry.intersectionRatio > 0.24,
        );

        if (!shouldReveal) {
          return;
        }

        revealFooter();
        observer.disconnect();
      },
      {
        threshold: [0.16, 0.24, 0.36],
        rootMargin: '0px 0px -8% 0px',
      },
    );

    observer.observe(footer);
    cleanups.push(() => observer.disconnect());
    listenToMediaQuery(
      reduceMotion,
      (event?: MediaQueryListEvent) => {
        if (event?.matches) {
          revealFooter();
        }
      },
      cleanups,
    );

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      footer.classList.remove('is-visible');
    };
  }, [footerRef]);
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
