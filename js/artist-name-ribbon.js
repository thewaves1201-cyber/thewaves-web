(function () {
  "use strict";

  function syncRibbon(ribbon) {
    if (!ribbon) return;
    var band = ribbon.closest("section, .branded-hub__band");
    var root =
      (band &&
        band.querySelector(
          '[data-gallery-page="artist-management"][data-gallery-id="items"]'
        )) ||
      document.querySelector(
        '[data-gallery-page="artist-management"][data-gallery-id="items"]'
      );
    if (!root) return;

    ribbon.innerHTML = "";
    root.querySelectorAll(".gallery-card").forEach(function (card) {
      var link = document.createElement("a");
      link.href = card.getAttribute("href") || "#";
      var label = card.getAttribute("aria-label") || "";
      var strong = card.querySelector(".gallery-card__text strong");
      if (!label && strong) label = strong.textContent || "";
      link.textContent = label;
      ribbon.appendChild(link);
    });
  }

  function syncAll() {
    document.querySelectorAll(".artist-name-ribbon").forEach(syncRibbon);
  }

  document.addEventListener("waves-gallery:render", syncAll);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncAll);
  } else {
    syncAll();
  }
})();
