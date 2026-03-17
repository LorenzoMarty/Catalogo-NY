(function () {
  "use strict";

  var stage = document.getElementById("stores");
  var section = stage ? stage.querySelector(".stores-shell") : null;
  var shell = document.getElementById("stores-track-shell");
  var track = document.getElementById("stores-track");
  var currentLabel = document.getElementById("stores-current");
  var progressName = document.getElementById("stores-progress-name");
  var progressFill = document.getElementById("stores-progress-fill");

  if (!stage || !section || !shell || !track || !progressFill) {
    return;
  }

  var panels = Array.prototype.slice.call(track.querySelectorAll(".store-panel"));
  var images = Array.prototype.slice.call(stage.querySelectorAll(".store-image"));
  var wideMatch = window.matchMedia("(min-width: 768px)");
  var viewport = window.visualViewport || null;
  var state = {
    viewportHeight: 0,
    viewportWidth: 0,
    sectionTop: 0,
    sectionHeight: 0,
    maxHorizontal: 0,
    maxVertical: 0,
    current: 0,
    progress: 0,
    translateX: 0
  };
  var activeIndex = -1;
  var progressValue = -1;
  var renderFrame = 0;
  var measureFrame = 0;
  var resizeObserver = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getViewportHeight() {
    var visualHeight = viewport && viewport.height ? viewport.height : 0;
    var innerHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    return Math.max(1, Math.round(visualHeight || innerHeight));
  }

  function getViewportWidth() {
    return Math.max(window.innerWidth || document.documentElement.clientWidth || 0, 1);
  }

  function setViewportHeight(viewportHeight) {
    var resolvedHeight = Math.max(1, Math.round(viewportHeight));
    document.documentElement.style.setProperty("--app-height", resolvedHeight + "px");
    stage.style.setProperty("--app-height", resolvedHeight + "px");
  }

  function setActivePanel(index) {
    var safeIndex = clamp(index, 0, panels.length - 1);
    var panel = panels[safeIndex];

    if (safeIndex !== activeIndex) {
      activeIndex = safeIndex;
      panels.forEach(function (item, itemIndex) {
        item.classList.toggle("is-active", itemIndex === safeIndex);
      });

      if (currentLabel) {
        currentLabel.textContent = String(safeIndex + 1).padStart(2, "0");
      }

      if (progressName && panel) {
        progressName.textContent = panel.getAttribute("data-store-name") || "";
      }
    }
  }

  function setProgress(progress) {
    var clampedProgress = clamp(progress || 0, 0, 1);
    var resolvedFill = panels.length > 1
      ? ((clampedProgress * (panels.length - 1)) + 1) / panels.length
      : 1;

    if (Math.abs(clampedProgress - progressValue) < 0.001) {
      return;
    }

    progressValue = clampedProgress;

    if (wideMatch.matches) {
      progressFill.style.height = (resolvedFill * 100).toFixed(2) + "%";
      progressFill.style.width = "100%";
      return;
    }

    progressFill.style.width = (resolvedFill * 100).toFixed(2) + "%";
    progressFill.style.height = "100%";
  }

  function syncState(progress, translateX) {
    var panelWidth = Math.max(state.viewportWidth, 1);
    var resolvedIndex = clamp(Math.round((translateX || 0) / panelWidth), 0, panels.length - 1);

    setActivePanel(resolvedIndex);
    setProgress(progress);
  }

  function render(force) {
    renderFrame = 0;

    var scrollY = window.scrollY || window.pageYOffset || 0;
    var current = clamp(scrollY - state.sectionTop, 0, state.maxVertical);
    var progress = state.maxVertical > 0 ? current / state.maxVertical : 0;
    var translateX = progress * state.maxHorizontal;

    state.current = current;
    state.progress = progress;

    if (force || Math.abs(translateX - state.translateX) > 0.1) {
      track.style.transform = "translate3d(" + (-translateX).toFixed(3) + "px, 0, 0)";
      state.translateX = translateX;
    }

    syncState(progress, translateX);
  }

  function scheduleRender(force) {
    if (force) {
      if (renderFrame) {
        cancelAnimationFrame(renderFrame);
        renderFrame = 0;
      }

      render(true);
      return;
    }

    if (renderFrame) {
      return;
    }

    renderFrame = requestAnimationFrame(function () {
      render(false);
    });
  }

  function measure() {
    measureFrame = 0;

    var viewportHeight = getViewportHeight();
    var viewportWidth = getViewportWidth();
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var sectionTop = stage.getBoundingClientRect().top + scrollY;
    var maxHorizontal = Math.max(track.scrollWidth - viewportWidth, 0);
    var sectionHeight = maxHorizontal + viewportHeight;

    setViewportHeight(viewportHeight);

    state.viewportHeight = viewportHeight;
    state.viewportWidth = viewportWidth;
    state.sectionTop = sectionTop;
    state.sectionHeight = sectionHeight;
    state.maxHorizontal = maxHorizontal;
    state.maxVertical = Math.max(sectionHeight - viewportHeight, 0);

    stage.style.setProperty("--stores-section-height", sectionHeight + "px");
    section.style.height = sectionHeight + "px";
    section.style.minHeight = sectionHeight + "px";

    if (maxHorizontal <= 0) {
      state.translateX = 0;
      track.style.transform = "translate3d(0px, 0, 0)";
      syncState(0, 0);
      return;
    }

    scheduleRender(true);
  }

  function scheduleMeasure() {
    if (measureFrame) {
      return;
    }

    measureFrame = requestAnimationFrame(measure);
  }

  function bindImageLoad() {
    images.forEach(function (image) {
      if (image.complete) {
        return;
      }

      image.addEventListener("load", scheduleMeasure, { once: true });
      image.addEventListener("error", scheduleMeasure, { once: true });
    });
  }

  function bindResizeObserver() {
    if (typeof window.ResizeObserver !== "function") {
      return;
    }

    resizeObserver = new window.ResizeObserver(function () {
      scheduleMeasure();
    });

    resizeObserver.observe(stage);
    resizeObserver.observe(section);
    resizeObserver.observe(shell);
    resizeObserver.observe(track);
  }

  function bindViewportEvents() {
    window.addEventListener("scroll", function () {
      scheduleRender(false);
    }, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure, { passive: true });

    if (viewport) {
      viewport.addEventListener("resize", scheduleMeasure);
      viewport.addEventListener("scroll", scheduleMeasure);
    }

    if (typeof wideMatch.addEventListener === "function") {
      wideMatch.addEventListener("change", scheduleMeasure);
    } else if (typeof wideMatch.addListener === "function") {
      wideMatch.addListener(scheduleMeasure);
    }
  }

  bindImageLoad();
  bindResizeObserver();
  bindViewportEvents();

  if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
    document.fonts.ready.then(function () {
      scheduleMeasure();
    });
  }

  syncState(0, 0);
  scheduleMeasure();
}());
