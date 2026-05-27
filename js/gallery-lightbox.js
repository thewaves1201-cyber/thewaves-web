(function () {
  "use strict";

  var overlay = null;
  var imgEl = null;
  var videoWrap = null;
  var iframeEl = null;
  var captionEl = null;
  var counterEl = null;
  var btnSidePrev = null;
  var btnSideNext = null;
  var btnFullscreen = null;
  var lastFocus = null;

  var playlist = [];
  var playlistIndex = -1;
  var mode = "image";

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "gallery-lightbox";
    overlay.setAttribute("hidden", "");
    overlay.innerHTML =
      '<div class="gallery-lightbox__top">' +
      '<p class="gallery-lightbox__counter" hidden></p>' +
      '<div class="gallery-lightbox__top-actions">' +
      '<button type="button" class="gallery-lightbox__fs" aria-label="전체 화면" title="전체 화면">' +
      '<span aria-hidden="true">⛶</span></button>' +
      '<button type="button" class="gallery-lightbox__close" aria-label="닫기">×</button>' +
      "</div>" +
      "</div>" +
      '<button type="button" class="gallery-lightbox__side gallery-lightbox__side--prev" aria-label="이전 동영상" hidden></button>' +
      '<button type="button" class="gallery-lightbox__side gallery-lightbox__side--next" aria-label="다음 동영상" hidden></button>' +
      '<div class="gallery-lightbox__stage" role="presentation">' +
      '<img class="gallery-lightbox__img" alt="" />' +
      '<div class="gallery-lightbox__video" hidden>' +
      '<div class="gallery-lightbox__video-inner">' +
      '<iframe class="gallery-lightbox__iframe" title="YouTube 동영상" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>' +
      "</div>" +
      "</div>" +
      '<p class="gallery-lightbox__caption"></p>' +
      "</div>";

    document.body.appendChild(overlay);

    imgEl = overlay.querySelector(".gallery-lightbox__img");
    videoWrap = overlay.querySelector(".gallery-lightbox__video");
    iframeEl = overlay.querySelector(".gallery-lightbox__iframe");
    captionEl = overlay.querySelector(".gallery-lightbox__caption");
    counterEl = overlay.querySelector(".gallery-lightbox__counter");
    btnFullscreen = overlay.querySelector(".gallery-lightbox__fs");
    btnSidePrev = overlay.querySelector(".gallery-lightbox__side--prev");
    btnSideNext = overlay.querySelector(".gallery-lightbox__side--next");

    overlay.querySelector(".gallery-lightbox__close").addEventListener("click", close);

    btnSidePrev.addEventListener("click", function () {
      stepVideo(-1);
    });
    btnSideNext.addEventListener("click", function () {
      stepVideo(1);
    });

    btnFullscreen.addEventListener("click", toggleFullscreen);

    overlay.addEventListener("click", function (e) {
      if (
        e.target === overlay ||
        e.target.classList.contains("gallery-lightbox__stage")
      ) {
        close();
      }
    });
  }

  function setCaption(title) {
    if (!captionEl) return;
    if (title) {
      captionEl.textContent = title;
      captionEl.hidden = false;
    } else {
      captionEl.textContent = "";
      captionEl.hidden = true;
    }
  }

  function updateCounter() {
    if (!counterEl) return;
    if (mode !== "video" || playlist.length < 2) {
      counterEl.hidden = true;
      counterEl.textContent = "";
      return;
    }
    counterEl.hidden = false;
    counterEl.textContent = playlistIndex + 1 + " / " + playlist.length;
  }

  function updateNavVisibility() {
    var multi = mode === "video" && playlist.length > 1;
    if (btnSidePrev) btnSidePrev.hidden = !multi;
    if (btnSideNext) btnSideNext.hidden = !multi;
    if (btnFullscreen) btnFullscreen.hidden = mode !== "video";
  }

  function stopVideo() {
    if (iframeEl) iframeEl.src = "";
    if (videoWrap) videoWrap.hidden = true;
  }

  function showImageMode() {
    mode = "image";
    stopVideo();
    if (imgEl) imgEl.hidden = false;
    updateCounter();
    updateNavVisibility();
  }

  function showVideoMode() {
    mode = "video";
    if (imgEl) {
      imgEl.hidden = true;
      imgEl.removeAttribute("src");
    }
    if (videoWrap) videoWrap.hidden = false;
    updateCounter();
    updateNavVisibility();
  }

  function buildVideoPlaylist(trigger) {
    var scope =
      trigger.closest(".swiper-wrapper") ||
      trigger.closest(".band__slider-wrap") ||
      trigger.closest("main") ||
      document;
    var nodes = scope.querySelectorAll(
      ".gallery-card--video[data-youtube-id]"
    );
    return Array.prototype.map.call(nodes, function (el) {
      return {
        id: el.getAttribute("data-youtube-id") || "",
        title: el.getAttribute("data-lightbox-title") || "",
        el: el,
      };
    }).filter(function (item) {
      return !!item.id;
    });
  }

  function embedUrl(id) {
    return (
      "https://www.youtube.com/embed/" +
      encodeURIComponent(id) +
      "?autoplay=1&rel=0&modestbranding=1&playsinline=1"
    );
  }

  function openVideoAt(index) {
    if (!playlist.length || index < 0 || index >= playlist.length) return;
    playlistIndex = index;
    var item = playlist[index];
    showVideoMode();
    if (iframeEl) iframeEl.src = embedUrl(item.id);
    setCaption(item.title);
    updateCounter();
  }

  function openVideo(trigger) {
    playlist = buildVideoPlaylist(trigger);
    var start = 0;
    for (var i = 0; i < playlist.length; i++) {
      if (playlist[i].el === trigger) {
        start = i;
        break;
      }
    }
    if (!playlist.length) {
      var id = trigger.getAttribute("data-youtube-id");
      if (!id) return;
      playlist = [
        {
          id: id,
          title: trigger.getAttribute("data-lightbox-title") || "",
          el: trigger,
        },
      ];
      start = 0;
    }
    ensureOverlay();
    lastFocus = document.activeElement;
    overlay.removeAttribute("hidden");
    document.body.classList.add("gallery-lightbox-open");
    openVideoAt(start);
    overlay.querySelector(".gallery-lightbox__close").focus();
  }

  function stepVideo(delta) {
    if (mode !== "video" || playlist.length < 2) return;
    var next = playlistIndex + delta;
    if (next < 0) next = playlist.length - 1;
    if (next >= playlist.length) next = 0;
    openVideoAt(next);
  }

  function openImage(trigger) {
    var src = trigger.getAttribute("data-lightbox-src");
    if (!src) return;
    ensureOverlay();
    lastFocus = document.activeElement;
    playlist = [];
    playlistIndex = -1;
    showImageMode();
    imgEl.src = src;
    imgEl.alt = trigger.getAttribute("data-lightbox-title") || "";
    setCaption(trigger.getAttribute("data-lightbox-title") || "");
    overlay.removeAttribute("hidden");
    document.body.classList.add("gallery-lightbox-open");
    overlay.querySelector(".gallery-lightbox__close").focus();
  }

  function close() {
    if (!overlay) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(function () {});
    }
    overlay.setAttribute("hidden", "");
    document.body.classList.remove("gallery-lightbox-open");
    stopVideo();
    if (imgEl) imgEl.removeAttribute("src");
    playlist = [];
    playlistIndex = -1;
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  function toggleFullscreen() {
    if (mode !== "video" || !videoWrap) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(function () {});
      return;
    }
    var inner = videoWrap.querySelector(".gallery-lightbox__video-inner");
    var target = inner || videoWrap;
    if (target.requestFullscreen) {
      target.requestFullscreen();
    }
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".gallery-card--lightbox");
    if (!trigger) return;
    e.preventDefault();
    e.stopPropagation();
    if (trigger.classList.contains("gallery-card--video")) {
      openVideo(trigger);
    } else {
      openImage(trigger);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!overlay || overlay.hasAttribute("hidden")) return;
    if (e.key === "Escape") {
      close();
      return;
    }
    if (mode !== "video" || playlist.length < 2) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepVideo(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      stepVideo(1);
    }
  });
})();
