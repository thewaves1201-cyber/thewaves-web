(function () {
  "use strict";

  function initHeaderNav() {
  var header = document.querySelector(".site-header");
  var mega = document.getElementById("mega-panel");
  var navItems = document.querySelectorAll(".nav__item[data-mega]");
  var megaCols = mega ? mega.querySelectorAll(".mega__col") : [];
  var navToggle = document.querySelector(".nav-toggle");
  var body = document.body;
  var hideTimer = null;

  function setNavHover(key) {
    navItems.forEach(function (item) {
      var match = item.getAttribute("data-mega") === key;
      item.classList.toggle("is-mega-hover", match);
    });
  }

  function setMegaColumnHighlight(key) {
    if (!mega) return;
    mega.classList.toggle("is-highlight", !!key);
    megaCols.forEach(function (col) {
      col.classList.toggle("is-active", col.getAttribute("data-col") === key);
    });
  }

  function showMega() {
    if (!mega || window.innerWidth <= 900) return;
    mega.removeAttribute("hidden");
    if (header) header.classList.add("is-mega-open");
  }

  function hideMega() {
    if (!mega) return;
    mega.setAttribute("hidden", "");
    if (header) header.classList.remove("is-mega-open");
    setNavHover(null);
    setMegaColumnHighlight(null);
  }

  function openFromNav(key) {
    showMega();
    setNavHover(key);
    setMegaColumnHighlight(null);
  }

  function openFromMegaCol(key) {
    showMega();
    setNavHover(null);
    setMegaColumnHighlight(key);
  }

  function scheduleCloseMega() {
    if (!mega || window.innerWidth <= 900) return;
    hideTimer = window.setTimeout(hideMega, 140);
  }

  function cancelCloseMega() {
    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function findNavKeyFromTarget(target) {
    if (!target || !target.closest) return null;
    var item = target.closest(".nav__item[data-mega]");
    if (!item) return null;
    return item.getAttribute("data-mega");
  }

  if (header && mega) {
    header.addEventListener("mouseenter", cancelCloseMega);

    header.addEventListener("mouseleave", function () {
      scheduleCloseMega();
    });

    navItems.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        cancelCloseMega();
        openFromNav(item.getAttribute("data-mega"));
      });

      item.addEventListener("mouseleave", function (e) {
        var to = e.relatedTarget;
        if (to && item.contains(to)) return;
        if (mega && mega.contains(to)) return;
        setNavHover(null);
      });
    });

    mega.addEventListener("mouseenter", function () {
      cancelCloseMega();
      setNavHover(null);
    });

    megaCols.forEach(function (col) {
      col.addEventListener("mouseenter", function () {
        cancelCloseMega();
        openFromMegaCol(col.getAttribute("data-col"));
      });
    });

    mega.addEventListener("mouseleave", function (e) {
      var to = e.relatedTarget;
      if (to && mega.contains(to)) return;
      setMegaColumnHighlight(null);
      var navKey = findNavKeyFromTarget(to);
      if (navKey) {
        setNavHover(navKey);
      }
    });
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        hideMega();
      }
    });
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) {
      body.classList.remove("nav-open");
      if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    } else {
      hideMega();
    }
  });

  function updateHeaderScrollState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  }

  updateHeaderScrollState();
  window.addEventListener("scroll", updateHeaderScrollState, { passive: true });
  }

  function bootHeaderNav() {
    if (
      window.WavesSiteSettings &&
      typeof window.WavesSiteSettings.applyToDocument === "function"
    ) {
      window.WavesSiteSettings.applyToDocument();
    }
    initHeaderNav();
  }

  if (window.WavesSiteSettings && typeof window.WavesSiteSettings.whenSiteReady === "function") {
    window.WavesSiteSettings.whenSiteReady(bootHeaderNav);
  } else {
    bootHeaderNav();
  }
})();
