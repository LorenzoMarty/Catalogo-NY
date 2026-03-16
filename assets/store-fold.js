(function () {
  "use strict";

  var stage = document.getElementById("stores");
  var shell = document.getElementById("stores-track-shell");
  var track = document.getElementById("stores-track");
  var currentLabel = document.getElementById("stores-current");
  var progressName = document.getElementById("stores-progress-name");
  var progressFill = document.getElementById("stores-progress-fill");

  if (!stage || !shell || !track || !progressFill) {
    return;
  }

  var panels = Array.prototype.slice.call(track.querySelectorAll(".store-panel"));
  var reducedMotionMatch = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wideMatch = window.matchMedia("(min-width: 768px)");
  var pinnedTween = null;
  var pinnedTriggers = [];
  var nativeScrollBound = false;
  var lastProgress = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setActivePanel(index) {
    var safeIndex = clamp(index, 0, panels.length - 1);
    var activePanel = panels[safeIndex];

    panels.forEach(function (panel, panelIndex) {
      panel.classList.toggle("is-active", panelIndex === safeIndex);
    });

    if (currentLabel) {
      currentLabel.textContent = String(safeIndex + 1).padStart(2, "0");
    }

    if (progressName && activePanel) {
      progressName.textContent = activePanel.getAttribute("data-store-name") || "";
    }
  }

  function setProgress(progress) {
    var clampedProgress = clamp(progress || 0, 0, 1);
    var resolvedFill = panels.length > 1
      ? ((clampedProgress * (panels.length - 1)) + 1) / panels.length
      : 1;

    if (wideMatch.matches && !stage.classList.contains("is-native-scroll")) {
      progressFill.style.height = (resolvedFill * 100).toFixed(2) + "%";
      progressFill.style.width = "100%";
      return;
    }

    progressFill.style.width = (resolvedFill * 100).toFixed(2) + "%";
    progressFill.style.height = "100%";
  }

  function syncState(progress, index) {
    var resolvedIndex = typeof index === "number"
      ? clamp(index, 0, panels.length - 1)
      : clamp(Math.round(clamp(progress || 0, 0, 1) * (panels.length - 1)), 0, panels.length - 1);
    var resolvedProgress = typeof progress === "number"
      ? clamp(progress, 0, 1)
      : (panels.length > 1 ? resolvedIndex / (panels.length - 1) : 1);

    lastProgress = resolvedProgress;

    setActivePanel(resolvedIndex);
    setProgress(resolvedProgress);
  }

  function handleNativeScroll() {
    var maxScroll = Math.max(shell.scrollWidth - shell.clientWidth, 1);
    var progress = shell.scrollLeft / maxScroll;
    var index = Math.round(shell.scrollLeft / Math.max(shell.clientWidth, 1));
    syncState(progress, index);
  }

  function bindNativeScroll() {
    if (nativeScrollBound) {
      return;
    }

    shell.addEventListener("scroll", handleNativeScroll, { passive: true });
    nativeScrollBound = true;
  }

  function unbindNativeScroll() {
    if (!nativeScrollBound) {
      return;
    }

    shell.removeEventListener("scroll", handleNativeScroll);
    nativeScrollBound = false;
  }

  function destroyPinnedScroll() {
    pinnedTriggers.forEach(function (trigger) {
      trigger.kill();
    });
    pinnedTriggers = [];

    if (pinnedTween) {
      if (pinnedTween.scrollTrigger) {
        pinnedTween.scrollTrigger.kill();
      }
      pinnedTween.kill();
      pinnedTween = null;
    }

    track.style.transform = "";
  }

  function buildPinnedScroll() {
    if (!window.gsap || !window.ScrollTrigger) {
      return false;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);

    var travel = function () {
      return Math.max(track.scrollWidth - window.innerWidth, 0);
    };

    pinnedTween = window.gsap.to(track, {
      x: function () {
        return -travel();
      },
      ease: "none",
      overwrite: "auto",
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: function () {
          return "+=" + travel();
        },
        pin: true,
        scrub: window.innerWidth < 768 ? 1.15 : 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          syncState(self.progress);
        }
      }
    });

    panels.forEach(function (panel) {
      var image = panel.querySelector(".store-image");

      if (!image) {
        return;
      }

      var trigger = window.gsap.to(image, {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: panel,
          containerAnimation: pinnedTween,
          start: "left right",
          end: "right left",
          scrub: true
        }
      }).scrollTrigger;

      pinnedTriggers.push(trigger);
    });

    syncState(0, 0);
    window.ScrollTrigger.refresh();
    return true;
  }

  function enableNativeMode() {
    destroyPinnedScroll();
    stage.classList.add("is-native-scroll");
    bindNativeScroll();
    requestAnimationFrame(handleNativeScroll);
  }

  function enablePinnedMode() {
    stage.classList.remove("is-native-scroll");
    unbindNativeScroll();
    shell.scrollLeft = 0;

    if (!buildPinnedScroll()) {
      enableNativeMode();
    }
  }

  function syncMode() {
    if (!reducedMotionMatch.matches) {
      enablePinnedMode();
      return;
    }

    enableNativeMode();
  }

  function handleResize() {
    if (stage.classList.contains("is-native-scroll")) {
      handleNativeScroll();
      return;
    }

    setProgress(lastProgress);
  }

  syncState(0, 0);
  syncMode();

  if (typeof wideMatch.addEventListener === "function") {
    wideMatch.addEventListener("change", syncMode);
    reducedMotionMatch.addEventListener("change", syncMode);
  } else if (typeof wideMatch.addListener === "function") {
    wideMatch.addListener(syncMode);
    reducedMotionMatch.addListener(syncMode);
  }

  window.addEventListener("resize", handleResize, { passive: true });
}());
