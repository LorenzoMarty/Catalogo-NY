(function () {
  var body = document.body;
  var menuBtn = document.getElementById("menu-btn");
  var mobileMenu = document.getElementById("mobile-menu");
  var iconMenu = document.getElementById("icon-menu");
  var iconClose = document.getElementById("icon-close");
  var menuOpen = false;

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
  window.addEventListener("scroll", syncScrollState, { passive: true });

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.from(".hero-title-l", { y: 34, opacity: 0, duration: 1.02, ease: "power4.out" });
    window.gsap.from(".hero-title-r", { y: 34, opacity: 0, duration: 1.02, delay: 0.08, ease: "power4.out" });
    window.gsap.from(".hero-copy .reveal", { y: 24, opacity: 0, duration: 0.92, stagger: 0.1, delay: 0.26, ease: "power3.out" });
    window.gsap.from(".hero-rail .reveal", { y: 22, opacity: 0, duration: 0.92, delay: 0.44, ease: "power3.out" });
    window.gsap.to(".parallax-media img", {
      scale: 1.12,
      yPercent: 5,
      ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
    });
  }
}());
