(function () {
  "use strict";

  var root = document.querySelector(".page-branded-hub");
  if (!root) return;

  var isDetailPage = root.classList.contains("page-branded-detail");
  var initialRows = isDetailPage ? 3 : 1;

  function colsPerRow() {
    var w = window.innerWidth;
    if (isDetailPage) {
      if (w >= 900) return 4;
      if (w >= 640) return 2;
      return 1;
    }
    if (w >= 720) return 3;
    return 1;
  }

  function initBand(band) {
    var swiperEl = band.querySelector(".gallery-swiper--gridBand");
    var inner = swiperEl && swiperEl.querySelector(".swiper-wrapper");
    var btn = band.querySelector(".branded-hub__more--expand");
    var moreWrap = band.querySelector(".branded-hub__more-wrap");
    if (!swiperEl || !inner || !btn) return;

    swiperEl.classList.add("branded-hub-grid-swiper");
    var rows = initialRows;

    function setMoreVisible(show) {
      btn.hidden = !show;
      btn.setAttribute("aria-hidden", show ? "false" : "true");
      if (moreWrap) {
        moreWrap.hidden = !show;
        moreWrap.setAttribute("aria-hidden", show ? "false" : "true");
      }
    }

    function apply() {
      var slides = inner.querySelectorAll(".swiper-slide");
      var total = slides.length;
      var cols = colsPerRow();
      var capacity = Math.max(cols, rows * cols);
      var visible = Math.min(total, capacity);

      slides.forEach(function (slide, i) {
        if (i < visible) {
          slide.removeAttribute("hidden");
        } else {
          slide.setAttribute("hidden", "");
        }
      });

      var hasMore = total > 0 && visible < total;
      setMoreVisible(hasMore);
      band.classList.toggle("is-collapsed", rows <= 1);
      band.classList.toggle("is-expanded", !hasMore && total > 0);
    }

    band._hubApply = apply;
    band.dataset.hubGridReady = "1";
    apply();

    btn.addEventListener("click", function () {
      rows += 1;
      apply();
    });

    window.addEventListener("resize", apply);
  }

  function ensureBands() {
    root.querySelectorAll(".branded-hub__band").forEach(function (band) {
      if (band.dataset.hubGridReady === "1") {
        if (typeof band._hubApply === "function") {
          band._hubApply();
        }
        return;
      }
      var inner = band.querySelector(
        ".gallery-swiper--gridBand .swiper-wrapper"
      );
      if (!inner || !inner.querySelector(".swiper-slide")) return;
      initBand(band);
    });
  }

  document.addEventListener("waves-gallery:render", ensureBands);
  ensureBands();
})();
