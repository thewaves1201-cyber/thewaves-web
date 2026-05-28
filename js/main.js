(function () {
  "use strict";

  function bootGalleryAndSwipers() {
    if (
      window.WavesGallery &&
      typeof window.WavesGallery.renderIntoPage === "function"
    ) {
      window.WavesGallery.renderIntoPage();
    }
    initSwipers();
  }

  function getMusicStripSpv(swiper) {
    var spv = swiper.params.slidesPerView;
    if (typeof spv === "number") return spv;
    var bp = swiper.currentBreakpoint;
    if (
      bp &&
      swiper.params.breakpoints &&
      swiper.params.breakpoints[bp] &&
      typeof swiper.params.breakpoints[bp].slidesPerView === "number"
    ) {
      return swiper.params.breakpoints[bp].slidesPerView;
    }
    return 6.25;
  }

  function musicStripSlideWidth(swiper) {
    var spv = getMusicStripSpv(swiper);
    var space = swiper.params.spaceBetween || 0;
    return (swiper.width - space * (spv - 1)) / spv;
  }

  /** 가운데 6개 전체 + 좌·우 동일하게 반씩 잘리도록 시작 위치 맞춤 */
  function musicStripApplyPeek(swiper) {
    if (!swiper || swiper.destroyed) return;
    var slideW = musicStripSlideWidth(swiper);
    if (!slideW || slideW <= 0) return;
    var space = swiper.params.spaceBetween || 0;
    var peek = (slideW + space) * 0.5;
    swiper.setTranslate(swiper.getTranslate() - peek);
    swiper.updateProgress();
    swiper.updateSlidesClasses();
  }

  function padSlidesForLoop(wrapper, minCount) {
    if (!wrapper) return 0;
    var slides = Array.from(wrapper.querySelectorAll(".swiper-slide"));
    var n = slides.length;
    if (n <= 1 || n >= minCount) return n;
    var i = 0;
    while (wrapper.querySelectorAll(".swiper-slide").length < minCount) {
      wrapper.appendChild(slides[i % n].cloneNode(true));
      i += 1;
    }
    return wrapper.querySelectorAll(".swiper-slide").length;
  }

  function initSwipers() {
    if (typeof Swiper === "undefined") return;
    var heroEl = document.querySelector(".hero-swiper");
    var heroSlides = heroEl
      ? heroEl.querySelectorAll(".swiper-wrapper .swiper-slide")
      : [];
    if (heroEl && heroSlides.length) {
      if (heroEl.swiper) {
        heroEl.swiper.destroy(true, true);
      }
      var heroCount = heroSlides.length;
      var heroCfg = {
        /* rewind는 8→1 때 7,6,5… 역방향으로 쭉 돌아감. loop는 앞으로 1번으로 넘김 */
        loop: heroCount > 1,
        rewind: false,
        loopAdditionalSlides: 0,
        speed: 900,
        navigation: {
          prevEl: ".hero-swiper__nav--prev",
          nextEl: ".hero-swiper__nav--next",
        },
      };
      if (heroCount > 1) {
        heroCfg.loopedSlides = heroCount;
        heroCfg.autoplay = {
          delay: 6500,
          disableOnInteraction: false,
        };
      }
      new Swiper(heroEl, heroCfg);
    }

    document.querySelectorAll(".band__slider-wrap").forEach(function (wrap) {
      var el = wrap.querySelector(".gallery-swiper");
      var prev = wrap.querySelector(".gallery-nav-prev");
      var next = wrap.querySelector(".gallery-nav-next");
      if (!el) return;
      if (!el.querySelector(".swiper-slide")) return;

      var isSquare = el.classList.contains("gallery-swiper--square");
      var musicStrip = el.classList.contains("gallery-swiper--musicStrip");
      var artistRow = el.classList.contains("gallery-swiper--artistRow");
      var publishGrid = el.classList.contains("gallery-swiper--publishGrid");
      var gridBand =
        !isSquare && el.classList.contains("gallery-swiper--gridBand");
      var brandedHub = wrap.closest(".page-branded-hub");
      var artistPage = wrap.closest(".artist-page");
      var artistAlbumGrid =
        artistPage &&
        isSquare &&
        el.classList.contains("artist-page__album-swiper");
      var artistLiveGrid =
        artistPage &&
        !isSquare &&
        el.classList.contains("artist-page__live-swiper");

      if (brandedHub && (artistRow || gridBand)) {
        return;
      }

      if (artistPage) {
        if (prev) prev.hidden = true;
        if (next) next.hidden = true;
      }

      if (artistAlbumGrid || artistLiveGrid) {
        return;
      }

      if (el.swiper && !el.swiper.destroyed) {
        el.swiper.destroy(true, true);
      }

      if (artistRow) {
        new Swiper(el, {
          slidesPerView: 2,
          spaceBetween: 12,
          speed: 600,
          grabCursor: true,
          watchOverflow: true,
          navigation: {
            prevEl: prev,
            nextEl: next,
          },
          breakpoints: {
            640: {
              slidesPerView: 3,
              spaceBetween: 14,
            },
            960: {
              slidesPerView: 4,
              spaceBetween: 16,
            },
            1280: {
              slidesPerView: 5,
              spaceBetween: 18,
            },
          },
        });
        return;
      }

      if (publishGrid) {
        new Swiper(el, {
          slidesPerView: 1,
          spaceBetween: 14,
          speed: 600,
          grabCursor: true,
          watchOverflow: true,
          grid: {
            rows: 1,
            fill: "row",
          },
          navigation: {
            prevEl: prev,
            nextEl: next,
          },
          breakpoints: {
            560: {
              slidesPerView: 2,
              spaceBetween: 16,
              grid: {
                rows: 1,
                fill: "row",
              },
            },
            980: {
              slidesPerView: 3,
              spaceBetween: 20,
              grid: {
                rows: 1,
                fill: "row",
              },
            },
          },
        });
        return;
      }

      if (gridBand) {
        new Swiper(el, {
          slidesPerView: 1,
          spaceBetween: 12,
          speed: 600,
          grabCursor: true,
          watchOverflow: true,
          grid: {
            rows: 1,
            fill: "row",
          },
          navigation: {
            prevEl: prev,
            nextEl: next,
          },
          breakpoints: {
            520: {
              slidesPerView: 2,
              spaceBetween: 14,
              grid: {
                rows: 2,
                fill: "row",
              },
            },
            960: {
              slidesPerView: 3,
              spaceBetween: 18,
              grid: {
                rows: 2,
                fill: "row",
              },
            },
            1320: {
              slidesPerView: 4,
              spaceBetween: 20,
              grid: {
                rows: 2,
                fill: "row",
              },
            },
          },
        });
        return;
      }

      var orbit = el.classList.contains("gallery-swiper--orbit");
      var wrapper = el.querySelector(".swiper-wrapper");
      var slideCount = el.querySelectorAll(".swiper-slide").length;

      if (orbit) {
        slideCount = padSlidesForLoop(wrapper, 10);
        var orbitCfg = {
          slidesPerView: 2,
          spaceBetween: 14,
          speed: 650,
          grabCursor: true,
          watchOverflow: true,
          centeredSlides: false,
          navigation: {
            prevEl: prev,
            nextEl: next,
          },
          autoplay:
            slideCount > 1
              ? {
                  delay: 3800,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false,
          breakpoints: {
            640: {
              slidesPerView: 3,
              spaceBetween: 14,
            },
            960: {
              slidesPerView: 4,
              spaceBetween: 16,
            },
            1280: {
              slidesPerView: 5,
              spaceBetween: 18,
            },
          },
        };
        if (slideCount > 1) {
          orbitCfg.loop = true;
          orbitCfg.loopAdditionalSlides = 3;
        }
        new Swiper(el, orbitCfg);
        return;
      }

      if (musicStrip) {
        slideCount = padSlidesForLoop(wrapper, 10);
        var musicCfg = {
          slidesPerView: 2.25,
          spaceBetween: 14,
          speed: 600,
          grabCursor: true,
          watchOverflow: false,
          roundLengths: true,
          resistanceRatio: 0,
          navigation: {
            prevEl: prev,
            nextEl: next,
          },
          breakpoints: {
            560: {
              slidesPerView: 3.25,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 4.25,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 5.25,
              spaceBetween: 18,
            },
            1280: {
              slidesPerView: 6.25,
              spaceBetween: 20,
            },
          },
          on: {
            afterInit: function (swiper) {
              requestAnimationFrame(function () {
                musicStripApplyPeek(swiper);
              });
            },
            resize: function (swiper) {
              swiper.update();
              if (swiper.params.loop) {
                swiper.slideToLoop(swiper.realIndex || 0, 0, false);
              }
              musicStripApplyPeek(swiper);
            },
            breakpoint: function (swiper) {
              requestAnimationFrame(function () {
                swiper.update();
                musicStripApplyPeek(swiper);
              });
            },
            slideChangeTransitionEnd: function (swiper) {
              musicStripApplyPeek(swiper);
            },
          },
        };
        if (slideCount > 1) {
          musicCfg.loop = true;
          musicCfg.loopAdditionalSlides = 4;
          musicCfg.loopedSlides = Math.min(slideCount, 12);
        }
        new Swiper(el, musicCfg);
        return;
      }

      var bandCfg = {
        slidesPerView: "auto",
        spaceBetween: isSquare ? 20 : 18,
        speed: 600,
        grabCursor: true,
        navigation: {
          prevEl: prev,
          nextEl: next,
        },
        breakpoints: {
          0: {
            spaceBetween: 14,
          },
          600: {
            spaceBetween: isSquare ? 18 : 16,
          },
          1024: {
            spaceBetween: isSquare ? 22 : 20,
          },
        },
      };
      if (slideCount > 1) {
        slideCount = padSlidesForLoop(wrapper, 8);
        bandCfg.loop = true;
        bandCfg.loopAdditionalSlides = 2;
      }
      new Swiper(el, bandCfg);
    });
  }

  document.addEventListener("waves-gallery:render", function () {
    initSwipers();
  });

  if (
    window.WavesGallery &&
    typeof window.WavesGallery.whenStorageReady === "function"
  ) {
    window.WavesGallery.whenStorageReady(bootGalleryAndSwipers);
  } else {
    bootGalleryAndSwipers();
  }
})();
