import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';

import { STORE_PANELS } from '../../data/stores.data';

type CleanupFn = () => void;

const DESKTOP_SCROLL_STRETCH = 1.45;
const MOBILE_SCROLL_STRETCH = 1.7;
const DESKTOP_SCROLL_LEAD_IN_RATIO = 0.14;
const MOBILE_SCROLL_LEAD_IN_RATIO = 0.30;

@Component({
  selector: 'app-stores-section',
  standalone: true,
  templateUrl: './stores-section.component.html',
  styleUrl: './stores-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoresSectionComponent implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);

  private readonly cleanups: CleanupFn[] = [];
  private readonly state = {
    viewportHeight: 0,
    viewportWidth: 0,
    sectionTop: 0,
    sectionHeight: 0,
    maxHorizontal: 0,
    maxVertical: 0,
    leadInOffset: 0,
    current: 0,
    progress: 0,
    translateX: 0,
  };

  private activePanelIndex = -1;
  private progressValue = -1;
  private renderFrame = 0;
  private measureFrame = 0;

  @ViewChild('stage', { static: true })
  private stageRef?: ElementRef<HTMLElement>;

  @ViewChild('storesShell', { static: true })
  private storesShellRef?: ElementRef<HTMLElement>;

  @ViewChild('trackShell', { static: true })
  private trackShellRef?: ElementRef<HTMLElement>;

  @ViewChild('track', { static: true })
  private trackRef?: ElementRef<HTMLElement>;

  @ViewChild('progressFill', { static: true })
  private progressFillRef?: ElementRef<HTMLElement>;

  protected readonly stores = STORE_PANELS;
  protected readonly activeIndex = signal(0);
  protected readonly currentStore = computed(() => this.stores[this.activeIndex()] ?? this.stores[0]);

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initializeShowcase();
    });
  }

  ngOnDestroy(): void {
    let cleanup: CleanupFn | undefined;

    while ((cleanup = this.cleanups.pop())) {
      cleanup();
    }

    this.document.documentElement.style.removeProperty('--app-height');
    this.stageRef?.nativeElement.style.removeProperty('--app-height');
    this.stageRef?.nativeElement.style.removeProperty('--stores-section-height');
    this.storesShellRef?.nativeElement.style.removeProperty('height');
    this.storesShellRef?.nativeElement.style.removeProperty('minHeight');
    this.trackRef?.nativeElement.style.removeProperty('transform');
  }

  private initializeShowcase(): void {
    const windowRef = this.document.defaultView;
    const stage = this.stageRef?.nativeElement;
    const section = this.storesShellRef?.nativeElement;
    const shell = this.trackShellRef?.nativeElement;
    const track = this.trackRef?.nativeElement;
    const progressFill = this.progressFillRef?.nativeElement;

    if (!windowRef || !stage || !section || !shell || !track || !progressFill) {
      return;
    }

    const panels = Array.from(track.querySelectorAll<HTMLElement>('.store-panel'));
    const images = Array.from(stage.querySelectorAll<HTMLImageElement>('.store-image'));
    const wideMatch = windowRef.matchMedia('(min-width: 768px)');
    const viewport = windowRef.visualViewport ?? null;

    const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

    const getViewportHeight = (): number => {
      const visualHeight = viewport?.height ?? 0;
      const innerHeight = windowRef.innerHeight || this.document.documentElement.clientHeight || 0;
      return Math.max(1, Math.round(visualHeight || innerHeight));
    };

    const getViewportWidth = (): number =>
      Math.max(windowRef.innerWidth || this.document.documentElement.clientWidth || 0, 1);

    const setViewportHeight = (viewportHeight: number): void => {
      const resolvedHeight = Math.max(1, Math.round(viewportHeight));
      this.document.documentElement.style.setProperty('--app-height', `${resolvedHeight}px`);
      stage.style.setProperty('--app-height', `${resolvedHeight}px`);
    };

    const clearHorizontalLayout = (): void => {
      stage.style.removeProperty('--stores-section-height');
      section.style.removeProperty('height');
      section.style.removeProperty('minHeight');
      track.style.removeProperty('transform');
      this.state.translateX = 0;
      this.state.maxHorizontal = 0;
      this.state.maxVertical = 0;
      this.state.leadInOffset = 0;
      this.state.progress = 0;
      this.state.current = 0;
    };

    const setActivePanel = (index: number): void => {
      const safeIndex = clamp(index, 0, panels.length - 1);

      if (safeIndex === this.activePanelIndex) {
        return;
      }

      this.activePanelIndex = safeIndex;
      this.ngZone.run(() => {
        this.activeIndex.set(safeIndex);
      });
    };

    const setProgress = (progress: number): void => {
      const clampedProgress = clamp(progress || 0, 0, 1);
      const resolvedFill =
        panels.length > 1 ? (clampedProgress * (panels.length - 1) + 1) / panels.length : 1;

      if (Math.abs(clampedProgress - this.progressValue) < 0.001) {
        return;
      }

      this.progressValue = clampedProgress;

      if (wideMatch.matches) {
        progressFill.style.height = `${(resolvedFill * 100).toFixed(2)}%`;
        progressFill.style.width = '100%';
        return;
      }

      progressFill.style.width = `${(resolvedFill * 100).toFixed(2)}%`;
      progressFill.style.height = '100%';
    };

    const syncState = (progress: number, translateX: number): void => {
      const panelWidth = Math.max(this.state.viewportWidth, 1);
      const resolvedIndex = clamp(Math.round((translateX || 0) / panelWidth), 0, panels.length - 1);
      setActivePanel(resolvedIndex);
      setProgress(progress);
    };

    const render = (force: boolean): void => {
      this.renderFrame = 0;

      const scrollY = windowRef.scrollY || windowRef.pageYOffset || 0;
      const current = clamp(scrollY - this.state.sectionTop, 0, this.state.maxVertical);
      const effectiveRange = Math.max(this.state.maxVertical - this.state.leadInOffset, 0);
      const delayedCurrent = Math.max(current - this.state.leadInOffset, 0);
      // Hold the first panel briefly before the horizontal motion begins.
      const progress = effectiveRange > 0 ? delayedCurrent / effectiveRange : 0;
      const translateX = progress * this.state.maxHorizontal;

      this.state.current = current;
      this.state.progress = progress;

      if (force || Math.abs(translateX - this.state.translateX) > 0.1) {
        track.style.transform = `translate3d(${-translateX.toFixed(3)}px, 0, 0)`;
        this.state.translateX = translateX;
      }

      syncState(progress, translateX);
    };

    const scheduleRender = (force: boolean): void => {
      if (force) {
        if (this.renderFrame) {
          windowRef.cancelAnimationFrame(this.renderFrame);
          this.renderFrame = 0;
        }

        render(true);
        return;
      }

      if (this.renderFrame) {
        return;
      }

      this.renderFrame = windowRef.requestAnimationFrame(() => {
        render(false);
      });
    };

    const measure = (): void => {
      this.measureFrame = 0;

      const viewportHeight = getViewportHeight();
      const viewportWidth = getViewportWidth();
      const scrollY = windowRef.scrollY || windowRef.pageYOffset || 0;
      const sectionTop = stage.getBoundingClientRect().top + scrollY;
      const maxHorizontal = Math.max(track.scrollWidth - viewportWidth, 0);
      const scrollStretch = wideMatch.matches ? DESKTOP_SCROLL_STRETCH : MOBILE_SCROLL_STRETCH;
      const leadInOffset = Math.round(
        viewportHeight * (wideMatch.matches ? DESKTOP_SCROLL_LEAD_IN_RATIO : MOBILE_SCROLL_LEAD_IN_RATIO),
      );
      const sectionHeight = maxHorizontal * scrollStretch + viewportHeight + leadInOffset;

      setViewportHeight(viewportHeight);

      this.state.viewportHeight = viewportHeight;
      this.state.viewportWidth = viewportWidth;
      this.state.sectionTop = sectionTop;
      this.state.maxHorizontal = maxHorizontal;
      this.state.sectionHeight = sectionHeight;
      this.state.maxVertical = Math.max(sectionHeight - viewportHeight, 0);
      this.state.leadInOffset = leadInOffset;

      stage.style.setProperty('--stores-section-height', `${sectionHeight}px`);
      section.style.height = `${sectionHeight}px`;
      section.style.minHeight = `${sectionHeight}px`;

      if (maxHorizontal <= 0) {
        this.state.translateX = 0;
        track.style.transform = 'translate3d(0px, 0, 0)';
        syncState(0, 0);
        return;
      }

      scheduleRender(true);
    };

    const scheduleMeasure = (): void => {
      if (this.measureFrame) {
        return;
      }

      this.measureFrame = windowRef.requestAnimationFrame(measure);
    };

    images.forEach((image) => {
      if (image.complete) {
        return;
      }

      this.addManagedListener(image, 'load', scheduleMeasure, { once: true });
      this.addManagedListener(image, 'error', scheduleMeasure, { once: true });
    });

    if (typeof windowRef.ResizeObserver === 'function') {
      const resizeObserver = new windowRef.ResizeObserver(() => {
        scheduleMeasure();
      });

      resizeObserver.observe(stage);
      resizeObserver.observe(section);
      resizeObserver.observe(shell);
      resizeObserver.observe(track);

      this.registerCleanup(() => {
        resizeObserver.disconnect();
      });
    }

    this.addManagedListener(
      windowRef,
      'scroll',
      () => {
        scheduleRender(false);
      },
      { passive: true },
    );
    this.addManagedListener(
      windowRef,
      'resize',
      scheduleMeasure,
      { passive: true },
    );
    this.addManagedListener(windowRef, 'orientationchange', scheduleMeasure, { passive: true });

    if (viewport) {
      this.addManagedListener(viewport, 'resize', scheduleMeasure);
      this.addManagedListener(viewport, 'scroll', scheduleMeasure);
    }

    this.listenToMediaQuery(wideMatch, scheduleMeasure);

    const fontsReady = this.document.fonts?.ready;
    if (fontsReady && typeof fontsReady.then === 'function') {
      void fontsReady.then(() => {
        scheduleMeasure();
      });
    }

    syncState(0, 0);
    scheduleMeasure();

    this.registerCleanup(() => {
      if (this.renderFrame) {
        windowRef.cancelAnimationFrame(this.renderFrame);
      }
      if (this.measureFrame) {
        windowRef.cancelAnimationFrame(this.measureFrame);
      }
      clearHorizontalLayout();
    });
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
}
