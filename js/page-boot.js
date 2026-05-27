(function () {
  "use strict";

  var root = document.documentElement;
  var needGallery = !!document.querySelector("[data-gallery-id]");
  var needSite = !!window.WavesSiteSettings;
  var galleryOk = !needGallery;
  var siteOk = !needSite;
  var revealed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;
    root.classList.add("waves-content-ready");
  }

  function maybeReveal() {
    if (galleryOk && siteOk) reveal();
  }

  if (needGallery && window.WavesGallery && window.WavesGallery.whenStorageReady) {
    window.WavesGallery.whenStorageReady(function () {
      galleryOk = true;
      maybeReveal();
    });
  } else {
    galleryOk = true;
  }

  if (needSite && window.WavesSiteSettings && window.WavesSiteSettings.whenSiteReady) {
    window.WavesSiteSettings.whenSiteReady(function () {
      siteOk = true;
      maybeReveal();
    });
  } else {
    siteOk = true;
  }

  maybeReveal();

  window.setTimeout(reveal, 8000);
})();
