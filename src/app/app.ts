import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';

import { CatalogSectionComponent } from './components/catalog-section/catalog-section.component';
import { SiteFooterComponent } from './components/site-footer/site-footer.component';
import { StoresSectionComponent } from './components/stores-section/stores-section.component';

type CleanupFn = () => void;

interface NetworkConnectionLike {
  effectiveType?: string;
  saveData?: boolean;
}

interface ExtendedNavigator extends Navigator {
  connection?: NetworkConnectionLike;
  mozConnection?: NetworkConnectionLike;
  webkitConnection?: NetworkConnectionLike;
}

interface RuntimeWindow extends Window {
  __CATALOGO_NY_APP_RUNTIME__?: {
    destroy: () => void;
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CatalogSectionComponent, StoresSectionComponent, SiteFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);

  private readonly cleanups: CleanupFn[] = [];
  private readonly runtimeKey = '__CATALOGO_NY_APP_RUNTIME__' as const;

  private menuOpen = false;
  private heroFrame = 0;
  private heroVisible = true;

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initializeRuntime();
    });
  }

  ngOnDestroy(): void {
    this.destroyRuntime();
  }

  private initializeRuntime(): void {
    const windowRef = this.getWindow();
    const body = this.document.body;

    if (!windowRef || !body) {
      return;
    }

    windowRef[this.runtimeKey]?.destroy();

    const elements = {
      body,
      menuBtn: this.document.getElementById('menu-btn') as HTMLButtonElement | null,
      mobileMenu: this.document.getElementById('mobile-menu') as HTMLDivElement | null,
      iconMenu: this.document.getElementById('icon-menu') as HTMLSpanElement | null,
      iconClose: this.document.getElementById('icon-close') as HTMLSpanElement | null,
      heroStage: this.document.getElementById('hero') as HTMLElement | null,
      heroMedia: this.document.querySelector('.parallax-media img') as HTMLImageElement | null,
    };

    const media = {
      reduceMotion: windowRef.matchMedia('(prefers-reduced-motion: reduce)'),
      wideMotion: windowRef.matchMedia('(min-width: 768px)'),
    };

    const navigatorRef = windowRef.navigator as ExtendedNavigator;
    const connection =
      navigatorRef.connection ?? navigatorRef.mozConnection ?? navigatorRef.webkitConnection ?? null;

    const shouldConserveData = (): boolean => {
      const effectiveType = connection?.effectiveType ?? '';
      return Boolean(connection?.saveData) || /^slow-?2g$|^2g$/.test(effectiveType);
    };

    const setMenuState = (nextState: boolean): void => {
      this.menuOpen = nextState;
      elements.body.classList.toggle('menu-open', this.menuOpen);
      elements.menuBtn?.setAttribute('aria-expanded', String(this.menuOpen));
      elements.mobileMenu?.setAttribute('aria-hidden', String(!this.menuOpen));
      elements.iconMenu?.classList.toggle('is-hidden', this.menuOpen);
      elements.iconClose?.classList.toggle('is-hidden', !this.menuOpen);
    };

    const resetHeroParallax = (): void => {
      if (!elements.heroMedia) {
        return;
      }

      elements.heroMedia.style.removeProperty('--hero-media-y');
      elements.heroMedia.style.removeProperty('--hero-media-scale');
    };

    const canAnimateHero = (): boolean =>
      Boolean(
        elements.heroStage &&
          elements.heroMedia &&
          this.heroVisible &&
          media.wideMotion.matches &&
          !media.reduceMotion.matches &&
          !shouldConserveData(),
      );

    const cancelHeroParallaxFrame = (): void => {
      if (!this.heroFrame) {
        return;
      }

      windowRef.cancelAnimationFrame(this.heroFrame);
      this.heroFrame = 0;
    };

    const updateHeroParallax = (): void => {
      this.heroFrame = 0;

      if (!elements.heroStage || !elements.heroMedia || !canAnimateHero()) {
        resetHeroParallax();
        return;
      }

      const rect = elements.heroStage.getBoundingClientRect();
      const viewportHeight = windowRef.innerHeight || this.document.documentElement.clientHeight || 1;
      const range = Math.max(rect.height, viewportHeight, 1);
      const traveled = Math.min(Math.max(-rect.top, 0), range);
      const progress = traveled / range;
      const translateY = progress * 34;
      const scale = 1.08 + progress * 0.04;

      elements.heroMedia.style.setProperty('--hero-media-y', `${translateY.toFixed(2)}px`);
      elements.heroMedia.style.setProperty('--hero-media-scale', scale.toFixed(4));
    };

    const scheduleHeroParallax = (): void => {
      if (!canAnimateHero()) {
        cancelHeroParallaxFrame();
        resetHeroParallax();
        return;
      }

      if (this.heroFrame) {
        return;
      }

      this.heroFrame = windowRef.requestAnimationFrame(updateHeroParallax);
    };

    const handleViewportChange = (): void => {
      scheduleHeroParallax();
    };

    const setupHeroObserver = (): void => {
      if (!elements.heroStage || !('IntersectionObserver' in windowRef)) {
        return;
      }

      const IntersectionObserverCtor = windowRef.IntersectionObserver as typeof IntersectionObserver;
      const heroObserver = new IntersectionObserverCtor(
        (entries: IntersectionObserverEntry[]) => {
          this.heroVisible = entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0);

          if (this.heroVisible) {
            scheduleHeroParallax();
            return;
          }

          cancelHeroParallaxFrame();
          resetHeroParallax();
        },
        {
          rootMargin: '220px 0px',
        },
      );

      heroObserver.observe(elements.heroStage);
      this.registerCleanup(() => {
        heroObserver.disconnect();
      });
    };

    const setupMenu = (): void => {
      if (elements.menuBtn) {
        this.addManagedListener(elements.menuBtn, 'click', () => {
          setMenuState(!this.menuOpen);
        });
      }

      if (elements.mobileMenu) {
        elements.mobileMenu.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
          this.addManagedListener(link, 'click', () => {
            setMenuState(false);
          });
        });
      }

      this.addManagedListener(this.document, 'keydown', (event: Event) => {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key === 'Escape' && this.menuOpen) {
          setMenuState(false);
        }
      });
    };

    this.registerCleanup(() => {
      cancelHeroParallaxFrame();
      resetHeroParallax();
      setMenuState(false);
    });

    setupMenu();
    setupHeroObserver();

    scheduleHeroParallax();

    this.addManagedListener(windowRef, 'scroll', handleViewportChange, { passive: true });
    this.addManagedListener(windowRef, 'resize', scheduleHeroParallax, { passive: true });
    this.listenToMediaQuery(media.reduceMotion, handleViewportChange);
    this.listenToMediaQuery(media.wideMotion, handleViewportChange);

    windowRef[this.runtimeKey] = {
      destroy: () => this.destroyRuntime(),
    };
  }

  private destroyRuntime(): void {
    let cleanup: CleanupFn | undefined;

    while ((cleanup = this.cleanups.pop())) {
      try {
        cleanup();
      } catch (error) {
        console.error(error);
      }
    }

    const windowRef = this.getWindow();
    if (windowRef?.[this.runtimeKey]?.destroy) {
      delete windowRef[this.runtimeKey];
    }
  }

  private addManagedListener(
    target: EventTarget | null,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions,
  ): void {
    if (!target || !('addEventListener' in target)) {
      return;
    }

    target.addEventListener(type, handler, options);
    this.registerCleanup(() => {
      target.removeEventListener(type, handler, options);
    });
  }

  private listenToMediaQuery(query: MediaQueryList, handler: (event?: MediaQueryListEvent) => void): void {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handler);
      this.registerCleanup(() => {
        query.removeEventListener('change', handler);
      });
      return;
    }

    if (typeof query.addListener === 'function') {
      query.addListener(handler);
      this.registerCleanup(() => {
        query.removeListener(handler);
      });
    }
  }

  private registerCleanup(cleanup: CleanupFn): void {
    this.cleanups.push(cleanup);
  }

  private getWindow(): RuntimeWindow | null {
    return (this.document.defaultView as RuntimeWindow | null) ?? null;
  }
}
