(function () {
  "use strict";

  var body = document.body;
  var menuBtn = document.getElementById("menu-btn");
  var mobileMenu = document.getElementById("mobile-menu");
  var iconMenu = document.getElementById("icon-menu");
  var iconClose = document.getElementById("icon-close");
  var heroStage = document.getElementById("hero");
  var heroMedia = document.querySelector(".parallax-media img");
  var categoriesStage = document.getElementById("categories");
  var storesStage = document.getElementById("stores");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wideMotion = window.matchMedia("(min-width: 768px)");
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  var menuOpen = false;
  var heroFrame = 0;
  var heroVisible = true;
  var loadedScripts = Object.create(null);

  function shouldConserveData() {
    var effectiveType = connection && connection.effectiveType ? connection.effectiveType : "";
    return Boolean(connection && connection.saveData) || /^slow-?2g$|^2g$/.test(effectiveType);
  }

  function setMenuState(nextState) {
    menuOpen = nextState;
    body.classList.toggle("menu-open", menuOpen);

    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", String(menuOpen));
    }

    if (mobileMenu) {
      mobileMenu.setAttribute("aria-hidden", String(!menuOpen));
    }

    if (iconMenu) {
      iconMenu.classList.toggle("is-hidden", menuOpen);
    }

    if (iconClose) {
      iconClose.classList.toggle("is-hidden", !menuOpen);
    }
  }

  function syncScrollState() {
    body.classList.toggle("is-scrolled", window.scrollY > 48);
  }

  function canAnimateHero() {
    return Boolean(heroStage && heroMedia && heroVisible && wideMotion.matches && !reduceMotion.matches && !shouldConserveData());
  }

  function resetHeroParallax() {
    if (!heroMedia) {
      return;
    }

    heroMedia.style.removeProperty("--hero-media-y");
    heroMedia.style.removeProperty("--hero-media-scale");
  }

  function updateHeroParallax() {
    heroFrame = 0;

    if (!canAnimateHero()) {
      resetHeroParallax();
      return;
    }

    var rect = heroStage.getBoundingClientRect();
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
    var range = Math.max(rect.height, viewportHeight, 1);
    var traveled = Math.min(Math.max(-rect.top, 0), range);
    var progress = traveled / range;
    var translateY = progress * 34;
    var scale = 1.08 + (progress * 0.04);

    heroMedia.style.setProperty("--hero-media-y", translateY.toFixed(2) + "px");
    heroMedia.style.setProperty("--hero-media-scale", scale.toFixed(4));
  }

  function scheduleHeroParallax() {
    if (!canAnimateHero() || heroFrame) {
      if (!canAnimateHero()) {
        resetHeroParallax();
      }
      return;
    }

    heroFrame = window.requestAnimationFrame(updateHeroParallax);
  }

  function clearScheduled(handle) {
    if (!handle) {
      return;
    }

    if (typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(handle);
      return;
    }

    window.clearTimeout(handle);
  }

  function loadScriptOnce(src) {
    if (loadedScripts[src]) {
      return loadedScripts[src];
    }

    loadedScripts[src] = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (existing.getAttribute("data-loaded") === "true") {
          resolve();
          return;
        }

        existing.addEventListener("load", function () {
          existing.setAttribute("data-loaded", "true");
          resolve();
        }, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = function () {
        script.setAttribute("data-loaded", "true");
        resolve();
      };
      script.onerror = function () {
        reject(new Error("Failed to load " + src));
      };
      document.body.appendChild(script);
    });

    return loadedScripts[src];
  }

  function loadScriptsSequential(sources) {
    return sources.reduce(function (chain, src) {
      return chain.then(function () {
        return loadScriptOnce(src);
      });
    }, Promise.resolve());
  }

  function setupLazyBundle(target, sources, options) {
    if (!target || !sources || !sources.length) {
      return;
    }

    var loaded = false;
    var observer = null;
    var idleHandle = 0;
    var scrollHandler = null;
    var settings = options || {};

    function cleanup() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      if (scrollHandler) {
        window.removeEventListener("scroll", scrollHandler);
        scrollHandler = null;
      }

      clearScheduled(idleHandle);
      idleHandle = 0;
    }

    function loadNow() {
      if (loaded) {
        return;
      }

      loaded = true;
      cleanup();
      loadScriptsSequential(sources).catch(function (error) {
        console.error(error);
      });
    }

    if (window.location.hash && window.location.hash.slice(1) === target.id) {
      loadNow();
      return;
    }

    if ("IntersectionObserver" in window) {
      observer = new window.IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting || entry.intersectionRatio > 0; })) {
          loadNow();
        }
      }, {
        rootMargin: settings.rootMargin || "0px"
      });

      observer.observe(target);
    } else {
      scrollHandler = function () {
        var rect = target.getBoundingClientRect();
        var threshold = (window.innerHeight || document.documentElement.clientHeight || 0) + (settings.offset || 0);

        if (rect.top <= threshold) {
          loadNow();
        }
      };

      window.addEventListener("scroll", scrollHandler, { passive: true });
      scrollHandler();
    }

    if (!shouldConserveData() && settings.idleTimeout) {
      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(loadNow, { timeout: settings.idleTimeout });
      } else {
        idleHandle = window.setTimeout(loadNow, Math.max(1400, settings.idleTimeout - 1200));
      }
    }
  }

  function bindHeroObserver() {
    if (!heroStage || !("IntersectionObserver" in window)) {
      return;
    }

    var heroObserver = new window.IntersectionObserver(function (entries) {
      heroVisible = entries.some(function (entry) {
        return entry.isIntersecting || entry.intersectionRatio > 0;
      });

      if (heroVisible) {
        scheduleHeroParallax();
        return;
      }

      resetHeroParallax();
    }, {
      rootMargin: "220px 0px"
    });

    heroObserver.observe(heroStage);
  }

  function handleViewportChange() {
    syncScrollState();
    scheduleHeroParallax();
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setMenuState(!menuOpen);
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuState(false);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menuOpen) {
      setMenuState(false);
    }
  });

  syncScrollState();
  scheduleHeroParallax();
  bindHeroObserver();

  window.addEventListener("scroll", handleViewportChange, { passive: true });
  window.addEventListener("resize", scheduleHeroParallax, { passive: true });

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", handleViewportChange);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(handleViewportChange);
  }

  if (typeof wideMotion.addEventListener === "function") {
    wideMotion.addEventListener("change", handleViewportChange);
  } else if (typeof wideMotion.addListener === "function") {
    wideMotion.addListener(handleViewportChange);
  }

  setupLazyBundle(categoriesStage, [
    "assets/catalog-image-manifest.js",
    "assets/catalog-fold.js"
  ], {
    rootMargin: "720px 0px",
    offset: 540,
    idleTimeout: 3200
  });

  setupLazyBundle(storesStage, [
    "assets/store-fold.js"
  ], {
    rootMargin: "560px 0px",
    offset: 420,
    idleTimeout: 4800
  });
}());
