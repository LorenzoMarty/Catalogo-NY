(function () {
  "use strict";

  var body = document.body;
  var menuBtn = document.getElementById("menu-btn");
  var mobileMenu = document.getElementById("mobile-menu");
  var iconMenu = document.getElementById("icon-menu");
  var iconClose = document.getElementById("icon-close");
  var heroStage = document.getElementById("hero");
  var heroMedia = document.querySelector(".parallax-media img");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var menuOpen = false;
  var heroFrame = 0;

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

  function updateHeroParallax() {
    heroFrame = 0;

    if (!heroStage || !heroMedia || reduceMotion.matches) {
      if (heroMedia) {
        heroMedia.style.removeProperty("--hero-media-y");
        heroMedia.style.removeProperty("--hero-media-scale");
      }
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
    if (!heroStage || !heroMedia || heroFrame) {
      return;
    }

    heroFrame = window.requestAnimationFrame(updateHeroParallax);
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
  updateHeroParallax();

  window.addEventListener("scroll", handleViewportChange, { passive: true });
  window.addEventListener("resize", scheduleHeroParallax, { passive: true });

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", updateHeroParallax);
  } else if (typeof reduceMotion.addListener === "function") {
    reduceMotion.addListener(updateHeroParallax);
  }
}());
