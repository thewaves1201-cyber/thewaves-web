(function () {
  "use strict";

  var hub = document.querySelector(".page-branded-hub");
  if (!hub) return;

  var subnav = hub.querySelector(".branded-hub__subnav");
  var header = document.querySelector(".site-header");

  function headerOffset() {
    return header ? header.offsetHeight + 16 : 80;
  }

  function scrollToId(id, behavior) {
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    var top =
      el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: behavior || "auto" });
  }

  function scrollFromHash(behavior) {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    scrollToId(hash.slice(1), behavior);
  }

  function setSubnavCurrent(id) {
    if (!subnav) return;
    subnav.querySelectorAll("a").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var hash = href.indexOf("#") >= 0 ? href.slice(href.indexOf("#")) : "";
      var match = hash && hash.slice(1) === id;
      if (match) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function applyHashState(behavior) {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    var id = hash.slice(1);
    scrollToId(id, behavior);
    setSubnavCurrent(id);
  }

  hub.addEventListener("click", function (e) {
    var link = e.target.closest('a[href*="#"]');
    if (!link || !hub.contains(link)) return;
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") {
      var idOnly = href && href.length > 1 ? href.slice(1) : "";
      if (!idOnly || !document.getElementById(idOnly)) return;
      e.preventDefault();
      history.pushState(null, "", "#" + idOnly);
      scrollToId(idOnly, "smooth");
      setSubnavCurrent(idOnly);
      return;
    }
    var hashIdx = href.indexOf("#");
    if (hashIdx < 0) return;
    var path = href.slice(0, hashIdx);
    var hash = href.slice(hashIdx);
    var onPage =
      !path ||
      path === window.location.pathname.split("/").pop() ||
      path === window.location.pathname;
    if (!onPage) return;
    var targetId = hash.length > 1 ? hash.slice(1) : "";
    if (!targetId || !document.getElementById(targetId)) return;
    e.preventDefault();
    history.pushState(null, "", hash);
    scrollToId(targetId, "smooth");
    setSubnavCurrent(targetId);
  });

  window.addEventListener("hashchange", function () {
    applyHashState("smooth");
  });

  function boot() {
    applyHashState("auto");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("waves-gallery:render", function () {
    if (window.location.hash) {
      applyHashState("auto");
    }
  });
})();
