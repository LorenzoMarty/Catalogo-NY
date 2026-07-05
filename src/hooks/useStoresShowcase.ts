import { useReducedMotion } from 'framer-motion';
import { Dispatch, RefObject, SetStateAction, useEffect } from 'react';

const DESKTOP_SCROLL_STRETCH = 1.45;
const MOBILE_SCROLL_STRETCH = 1.7;
const DESKTOP_SCROLL_LEAD_IN_RATIO = 0.14;
const MOBILE_SCROLL_LEAD_IN_RATIO = 0.3;

interface StoresShowcaseRefs {
  readonly stageRef: RefObject<HTMLElement | null>;
  readonly storesShellRef: RefObject<HTMLDivElement | null>;
  readonly trackShellRef: RefObject<HTMLDivElement | null>;
  readonly trackRef: RefObject<HTMLDivElement | null>;
  readonly progressFillRef: RefObject<HTMLSpanElement | null>;
}

interface StoresShowcaseOptions extends StoresShowcaseRefs {
  readonly setActiveIndex: Dispatch<SetStateAction<number>>;
}

export function useStoresShowcase({
  progressFillRef,
  setActiveIndex,
  stageRef,
  storesShellRef,
  trackRef,
  trackShellRef,
}: StoresShowcaseOptions): void {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const stage = stageRef.current;
    const section = storesShellRef.current;
    const shell = trackShellRef.current;
    const track = trackRef.current;
    const progressFill = progressFillRef.current;

    if (!stage || !section || !shell || !track || !progressFill) {
      return undefined;
    }

    if (reduceMotion) {
      const staticPanels = Array.from(track.querySelectorAll<HTMLElement>('.store-panel'));
      staticPanels.forEach((panel) => panel.classList.add('is-active'));
      progressFill.style.width = '100%';
      setActiveIndex(0);

      return () => {
        staticPanels.forEach((panel) => panel.classList.remove('is-active'));
        progressFill.style.removeProperty('width');
      };
    }

    const cleanups: Array<() => void> = [];
    const panels = Array.from(track.querySelectorAll<HTMLElement>('.store-panel'));
    const images = Array.from(stage.querySelectorAll<HTMLImageElement>('.store-image'));
    const wideMatch = window.matchMedia('(min-width: 768px)');
    const viewport = window.visualViewport ?? null;
    const state = {
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

    let activePanelIndex = -1;
    let progressValue = -1;
    let renderFrame = 0;
    let measureFrame = 0;

    const clamp = (value: number, min: number, max: number): number =>
      Math.min(max, Math.max(min, value));

    const getViewportHeight = (): number => {
      const visualHeight = viewport?.height ?? 0;
      const innerHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      return Math.max(1, Math.round(visualHeight || innerHeight));
    };

    const getViewportWidth = (): number =>
      Math.max(window.innerWidth || document.documentElement.clientWidth || 0, 1);

    const setViewportHeight = (viewportHeight: number): void => {
      const resolvedHeight = Math.max(1, Math.round(viewportHeight));
      document.documentElement.style.setProperty('--app-height', `${resolvedHeight}px`);
      stage.style.setProperty('--app-height', `${resolvedHeight}px`);
    };

    const clearHorizontalLayout = (): void => {
      stage.style.removeProperty('--stores-section-height');
      section.style.removeProperty('height');
      section.style.removeProperty('minHeight');
      track.style.removeProperty('transform');
      state.translateX = 0;
      state.maxHorizontal = 0;
      state.maxVertical = 0;
      state.leadInOffset = 0;
      state.progress = 0;
      state.current = 0;
    };

    const setActivePanel = (index: number): void => {
      const safeIndex = clamp(index, 0, panels.length - 1);

      if (safeIndex === activePanelIndex) {
        return;
      }

      activePanelIndex = safeIndex;
      setActiveIndex(safeIndex);
    };

    const setProgress = (progress: number): void => {
      const clampedProgress = clamp(progress || 0, 0, 1);
      const resolvedFill =
        panels.length > 1 ? (clampedProgress * (panels.length - 1) + 1) / panels.length : 1;

      if (Math.abs(clampedProgress - progressValue) < 0.001) {
        return;
      }

      progressValue = clampedProgress;

      if (wideMatch.matches) {
        progressFill.style.height = `${(resolvedFill * 100).toFixed(2)}%`;
        progressFill.style.width = '100%';
        return;
      }

      progressFill.style.width = `${(resolvedFill * 100).toFixed(2)}%`;
      progressFill.style.height = '100%';
    };

    const syncState = (progress: number, translateX: number): void => {
      const panelWidth = Math.max(state.viewportWidth, 1);
      const resolvedIndex = clamp(Math.round((translateX || 0) / panelWidth), 0, panels.length - 1);
      setActivePanel(resolvedIndex);
      setProgress(progress);
    };

    const render = (force: boolean): void => {
      renderFrame = 0;

      const scrollY = window.scrollY || window.pageYOffset || 0;
      const current = clamp(scrollY - state.sectionTop, 0, state.maxVertical);
      const effectiveRange = Math.max(state.maxVertical - state.leadInOffset, 0);
      const delayedCurrent = Math.max(current - state.leadInOffset, 0);
      const progress = effectiveRange > 0 ? delayedCurrent / effectiveRange : 0;
      const translateX = progress * state.maxHorizontal;

      state.current = current;
      state.progress = progress;

      if (force || Math.abs(translateX - state.translateX) > 0.1) {
        track.style.transform = `translate3d(${-translateX.toFixed(3)}px, 0, 0)`;
        state.translateX = translateX;
      }

      syncState(progress, translateX);
    };

    const scheduleRender = (force: boolean): void => {
      if (force) {
        if (renderFrame) {
          window.cancelAnimationFrame(renderFrame);
          renderFrame = 0;
        }

        render(true);
        return;
      }

      if (renderFrame) {
        return;
      }

      renderFrame = window.requestAnimationFrame(() => {
        render(false);
      });
    };

    const measure = (): void => {
      measureFrame = 0;

      const viewportHeight = getViewportHeight();
      const viewportWidth = getViewportWidth();
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const sectionTop = stage.getBoundingClientRect().top + scrollY;
      const maxHorizontal = Math.max(track.scrollWidth - viewportWidth, 0);
      const scrollStretch = wideMatch.matches ? DESKTOP_SCROLL_STRETCH : MOBILE_SCROLL_STRETCH;
      const leadInOffset = Math.round(
        viewportHeight *
          (wideMatch.matches ? DESKTOP_SCROLL_LEAD_IN_RATIO : MOBILE_SCROLL_LEAD_IN_RATIO),
      );
      const sectionHeight = maxHorizontal * scrollStretch + viewportHeight + leadInOffset;

      setViewportHeight(viewportHeight);

      state.viewportHeight = viewportHeight;
      state.viewportWidth = viewportWidth;
      state.sectionTop = sectionTop;
      state.maxHorizontal = maxHorizontal;
      state.sectionHeight = sectionHeight;
      state.maxVertical = Math.max(sectionHeight - viewportHeight, 0);
      state.leadInOffset = leadInOffset;

      stage.style.setProperty('--stores-section-height', `${sectionHeight}px`);
      section.style.height = `${sectionHeight}px`;
      section.style.minHeight = `${sectionHeight}px`;

      if (maxHorizontal <= 0) {
        state.translateX = 0;
        track.style.transform = 'translate3d(0px, 0, 0)';
        syncState(0, 0);
        return;
      }

      scheduleRender(true);
    };

    const scheduleMeasure = (): void => {
      if (measureFrame) {
        return;
      }

      measureFrame = window.requestAnimationFrame(measure);
    };

    images.forEach((image) => {
      if (image.complete) {
        return;
      }

      image.addEventListener('load', scheduleMeasure, { once: true });
      image.addEventListener('error', scheduleMeasure, { once: true });
      cleanups.push(() => {
        image.removeEventListener('load', scheduleMeasure);
        image.removeEventListener('error', scheduleMeasure);
      });
    });

    if (typeof window.ResizeObserver === 'function') {
      const resizeObserver = new ResizeObserver(() => {
        scheduleMeasure();
      });

      resizeObserver.observe(stage);
      resizeObserver.observe(section);
      resizeObserver.observe(shell);
      resizeObserver.observe(track);
      cleanups.push(() => resizeObserver.disconnect());
    }

    const handleScroll = (): void => {
      scheduleRender(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    window.addEventListener('orientationchange', scheduleMeasure, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', handleScroll));
    cleanups.push(() => window.removeEventListener('resize', scheduleMeasure));
    cleanups.push(() => window.removeEventListener('orientationchange', scheduleMeasure));

    if (viewport) {
      viewport.addEventListener('resize', scheduleMeasure);
      viewport.addEventListener('scroll', scheduleMeasure);
      cleanups.push(() => viewport.removeEventListener('resize', scheduleMeasure));
      cleanups.push(() => viewport.removeEventListener('scroll', scheduleMeasure));
    }

    listenToMediaQuery(wideMatch, scheduleMeasure, cleanups);

    const fontsReady = document.fonts?.ready;
    if (fontsReady && typeof fontsReady.then === 'function') {
      void fontsReady.then(() => {
        scheduleMeasure();
      });
    }

    syncState(0, 0);
    scheduleMeasure();

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      if (renderFrame) {
        window.cancelAnimationFrame(renderFrame);
      }
      if (measureFrame) {
        window.cancelAnimationFrame(measureFrame);
      }
      clearHorizontalLayout();
      document.documentElement.style.removeProperty('--app-height');
      stage.style.removeProperty('--app-height');
    };
  }, [
    progressFillRef,
    reduceMotion,
    setActiveIndex,
    stageRef,
    storesShellRef,
    trackRef,
    trackShellRef,
  ]);
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
