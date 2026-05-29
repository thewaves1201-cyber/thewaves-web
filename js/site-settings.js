(function () {
  "use strict";

  var STORAGE_KEY = "waves_site_v1";
  var SITE_DATA_URL = "data/site.json";
  var SITE_DEPLOY_REV = "20260528-design";

  var bundledSiteSettings = null;
  var siteSettingsReady = false;
  var siteReadyQueue = [];

  var DESIGN_DEFAULT = {
    sectionGap: 96,
    titleLineGap: 38,
    titleToLineGap: 38,
    lineToThumbGap: 38,
    titleSize: 19,
    cardTitleSize: 12,
    cardDescSize: 10,
  };

  var INNER_DESIGN_DEFAULT = {
    sectionGap: 52,
    hubTopGap: 40,
    hubHeroTitleSize: 44,
    hubHeroToSubnavGap: 18,
    hubSubnavSize: 15,
    hubSubnavGap: 28,
    hubIntroGap: 40,
    hubSectionGap: 52,
    titleLineGap: 32,
    hubTitleToLineGap: 20,
    hubLineToThumbGap: 32,
    titleSize: 22,
    cardTitleSize: 12,
    cardDescSize: 10,
  };

  function innerDesign(overrides) {
    return Object.assign({}, INNER_DESIGN_DEFAULT, overrides || {});
  }

  var DESIGN_PAGE_DEFAULTS = {
    index: Object.assign({}, DESIGN_DEFAULT),
    "branded-projects": innerDesign(),
    "brand-marketing": innerDesign(),
    "media-contents": innerDesign(),
    "entertainment-contents": innerDesign(),
    "music-business": innerDesign(),
    "music-publishing": innerDesign(),
    "artist-management": innerDesign(),
    about: innerDesign({ titleSize: 19 }),
    partners: innerDesign({
      titleSize: 19,
      partnerLogoHeight: 88,
      partnerLogoMaxWidth: 260,
      partnerCaptionSize: 12,
    }),
    contact: innerDesign({
      titleSize: 19,
      contactHeroBrandSize: 48,
      contactHeroTitleSize: 48,
      contactInfoSize: 16,
      contactLabelSize: 13,
    }),
    "artist-park-seo-young": innerDesign(),
    "artist-mincheon": innerDesign(),
    "artist-dain": innerDesign(),
    "artist-mauve": innerDesign(),
    "artist-solt": innerDesign(),
  };

  var ARTIST_LAYOUT_SYNC_SOURCE = "artist-park-seo-young";
  var ARTIST_LAYOUT_SYNC_TARGETS = {
    "artist-mincheon": true,
    "artist-dain": true,
    "artist-mauve": true,
    "artist-solt": true,
  };

  var DESIGN_PAGE_LIST = [
    {
      id: "index",
      label: "메인 (index.html)",
      path: "index.html",
      hash: "#media-production",
    },
    {
      id: "branded-projects",
      label: "BRANDED PROJECTS (허브)",
      path: "branded-projects.html",
      hash: "#brand-marketing",
    },
    {
      id: "brand-marketing",
      label: "BRAND MARKETING",
      path: "brand-marketing.html",
    },
    {
      id: "media-contents",
      label: "MEDIA CONTENTS",
      path: "media-contents.html",
    },
    {
      id: "entertainment-contents",
      label: "ENTERTAINMENT CONTENTS",
      path: "entertainment-contents.html",
    },
    {
      id: "music-business",
      label: "MUSIC BUSINESS",
      path: "music-business.html",
    },
    {
      id: "artist-management",
      label: "ARTIST MANAGEMENT",
      path: "artist-management.html",
    },
    {
      id: "music-publishing",
      label: "MUSIC PUBLISHING",
      path: "music-publishing.html",
    },
    { id: "about", label: "ABOUT US", path: "about.html" },
    { id: "partners", label: "PARTNERS", path: "partners.html" },
    { id: "contact", label: "CONTACT", path: "contact.html" },
    {
      id: "artist-park-seo-young",
      label: "Artist — Park Seo Young",
      path: "artist-park-seo-young.html",
    },
    {
      id: "artist-mincheon",
      label: "Artist — MINCHEON",
      path: "artist-mincheon.html",
    },
    {
      id: "artist-dain",
      label: "Artist — DAIN",
      path: "artist-dain.html",
    },
    {
      id: "artist-mauve",
      label: "Artist — MAUVE",
      path: "artist-mauve.html",
    },
    {
      id: "artist-solt",
      label: "Artist — SoLt",
      path: "artist-solt.html",
    },
  ];

  var DEFAULT = {
    logoUrl: "",
    aboutHeroUrl: "",
    youtubeUrl: "https://www.youtube.com/",
    instagramUrl: "https://www.instagram.com/",
    naverUrl: "https://blog.naver.com/",
    design: Object.assign({}, DESIGN_DEFAULT),
    designPages: {},
  };

  function defaultSocialUrl(label) {
    if (label === "YouTube") return DEFAULT.youtubeUrl;
    if (label === "Instagram") return DEFAULT.instagramUrl;
    if (label === "Naver Blog") return DEFAULT.naverUrl;
    return "";
  }

  function clampNum(n, min, max, fallback) {
    var v = Number(n);
    if (isNaN(v)) return fallback;
    return Math.min(max, Math.max(min, Math.round(v)));
  }

  function isHubDesignPage(pageId) {
    return !!pageId && pageId !== "index";
  }

  function designBaseForPage(pageId) {
    if (pageId === "index") return DESIGN_DEFAULT;
    if (pageId && DESIGN_PAGE_DEFAULTS[pageId]) {
      return DESIGN_PAGE_DEFAULTS[pageId];
    }
    return INNER_DESIGN_DEFAULT;
  }

  function normalizeDesign(raw, pageId) {
    var base = designBaseForPage(pageId);
    var d = raw && typeof raw === "object" ? raw : {};
    var sg = clampNum(d.sectionGap, 32, 180, base.sectionGap);
    var hubTop = base.hubTopGap != null ? base.hubTopGap : sg;
    var hubIntro = base.hubIntroGap != null ? base.hubIntroGap : sg;
    var hubSect = base.hubSectionGap != null ? base.hubSectionGap : sg;
    var legacyLine = clampNum(d.titleLineGap, 16, 72, base.titleLineGap);
    var defTitleLine =
      base.hubTitleToLineGap != null
        ? base.hubTitleToLineGap
        : base.titleToLineGap != null
          ? base.titleToLineGap
          : legacyLine;
    var defLineThumb =
      base.hubLineToThumbGap != null
        ? base.hubLineToThumbGap
        : base.lineToThumbGap != null
          ? base.lineToThumbGap
          : legacyLine;
    var out = {
      sectionGap: sg,
      hubTopGap: clampNum(d.hubTopGap, 16, 120, d.hubTopGap != null ? d.hubTopGap : hubTop),
      hubIntroGap: clampNum(
        d.hubIntroGap,
        16,
        120,
        d.hubIntroGap != null ? d.hubIntroGap : hubIntro
      ),
      hubSectionGap: clampNum(
        d.hubSectionGap,
        16,
        120,
        d.hubSectionGap != null ? d.hubSectionGap : hubSect
      ),
      hubHeroTitleSize: clampNum(
        d.hubHeroTitleSize,
        20,
        80,
        d.hubHeroTitleSize != null
          ? d.hubHeroTitleSize
          : base.hubHeroTitleSize != null
            ? base.hubHeroTitleSize
            : 44
      ),
      hubHeroToSubnavGap: clampNum(
        d.hubHeroToSubnavGap,
        0,
        72,
        d.hubHeroToSubnavGap != null
          ? d.hubHeroToSubnavGap
          : base.hubHeroToSubnavGap != null
            ? base.hubHeroToSubnavGap
            : 18
      ),
      hubSubnavSize: clampNum(
        d.hubSubnavSize,
        10,
        28,
        d.hubSubnavSize != null
          ? d.hubSubnavSize
          : base.hubSubnavSize != null
            ? base.hubSubnavSize
            : 15
      ),
      hubSubnavGap: clampNum(
        d.hubSubnavGap,
        8,
        72,
        d.hubSubnavGap != null
          ? d.hubSubnavGap
          : base.hubSubnavGap != null
            ? base.hubSubnavGap
            : 28
      ),
      titleLineGap: legacyLine,
      titleToLineGap: clampNum(
        d.titleToLineGap,
        8,
        72,
        d.titleToLineGap != null ? d.titleToLineGap : defTitleLine
      ),
      lineToThumbGap: clampNum(
        d.lineToThumbGap,
        8,
        72,
        d.lineToThumbGap != null ? d.lineToThumbGap : defLineThumb
      ),
      hubTitleToLineGap: clampNum(
        d.hubTitleToLineGap,
        8,
        72,
        d.hubTitleToLineGap != null ? d.hubTitleToLineGap : defTitleLine
      ),
      hubLineToThumbGap: clampNum(
        d.hubLineToThumbGap,
        8,
        72,
        d.hubLineToThumbGap != null ? d.hubLineToThumbGap : defLineThumb
      ),
      titleSize: clampNum(d.titleSize, 12, 32, base.titleSize),
      cardTitleSize: clampNum(d.cardTitleSize, 9, 20, base.cardTitleSize),
      cardDescSize: clampNum(d.cardDescSize, 8, 16, base.cardDescSize),
    };
    if (base.contactHeroBrandSize != null) {
      out.contactHeroBrandSize = clampNum(
        d.contactHeroBrandSize,
        24,
        80,
        d.contactHeroBrandSize != null ? d.contactHeroBrandSize : base.contactHeroBrandSize
      );
      out.contactHeroTitleSize = clampNum(
        d.contactHeroTitleSize,
        24,
        80,
        d.contactHeroTitleSize != null
          ? d.contactHeroTitleSize
          : base.contactHeroTitleSize != null
            ? base.contactHeroTitleSize
            : base.contactHeroBrandSize
      );
      out.contactInfoSize = clampNum(
        d.contactInfoSize,
        11,
        22,
        d.contactInfoSize != null ? d.contactInfoSize : base.contactInfoSize
      );
      out.contactLabelSize = clampNum(
        d.contactLabelSize,
        10,
        20,
        d.contactLabelSize != null ? d.contactLabelSize : base.contactLabelSize
      );
    }
    if (base.partnerLogoHeight != null || pageId === "partners") {
      out.partnerLogoHeight = clampNum(
        d.partnerLogoHeight,
        40,
        200,
        d.partnerLogoHeight != null
          ? d.partnerLogoHeight
          : base.partnerLogoHeight != null
            ? base.partnerLogoHeight
            : 88
      );
      out.partnerLogoMaxWidth = clampNum(
        d.partnerLogoMaxWidth,
        100,
        480,
        d.partnerLogoMaxWidth != null
          ? d.partnerLogoMaxWidth
          : base.partnerLogoMaxWidth != null
            ? base.partnerLogoMaxWidth
            : 260
      );
      out.partnerCaptionSize = clampNum(
        d.partnerCaptionSize,
        9,
        32,
        d.partnerCaptionSize != null
          ? d.partnerCaptionSize
          : base.partnerCaptionSize != null
            ? base.partnerCaptionSize
            : 12
      );
    }
    return out;
  }

  function normalizeDesignPages(raw) {
    var out = {};
    if (!raw || typeof raw !== "object") return out;
    Object.keys(raw).forEach(function (pageId) {
      out[pageId] = normalizeDesign(raw[pageId], pageId);
    });
    return out;
  }

  function applyDesignTokens(el, design, pageId) {
    if (!el) return;
    var pid = pageId || detectDesignPageId();
    var d = normalizeDesign(design, pid);
    var sgMin = Math.round((d.sectionGap * 80) / 96);
    var sgMax = Math.round((d.sectionGap * 112) / 96);
    el.style.setProperty(
      "--band-section-gap",
      "clamp(" + sgMin + "px, 10vw, " + sgMax + "px)"
    );
    var titleToLine = isHubDesignPage(pid) ? d.hubTitleToLineGap : d.titleToLineGap;
    var lineToThumb = isHubDesignPage(pid) ? d.hubLineToThumbGap : d.lineToThumbGap;
    el.style.setProperty("--band-title-to-line-gap", titleToLine + "px");
    el.style.setProperty("--band-line-to-thumb-gap", lineToThumb + "px");
    var tlgMin = Math.round((d.titleLineGap * 32) / 38);
    var tlgMax = Math.round((d.titleLineGap * 44) / 38);
    el.style.setProperty(
      "--band-title-line-gap",
      "clamp(" + tlgMin + "px, 4vw, " + tlgMax + "px)"
    );
    var tsMin = Math.round((d.titleSize * 17) / 19);
    var tsMax = Math.round((d.titleSize * 22) / 19);
    el.style.setProperty(
      "--band-title-size",
      "clamp(" + tsMin + "px, 1.75vw, " + tsMax + "px)"
    );
    el.style.setProperty("--orbit-card-title-size", d.cardTitleSize + "px");
    el.style.setProperty("--orbit-card-desc-size", d.cardDescSize + "px");
    el.style.setProperty(
      "--orbit-card-eyebrow-size",
      Math.max(8, d.cardDescSize - 1) + "px"
    );

    if (isHubDesignPage(pid)) {
      el.style.setProperty("--hub-top-gap", d.hubTopGap + "px");
      var hhs = d.hubHeroTitleSize != null ? d.hubHeroTitleSize : 44;
      var hhsMin = Math.round((hhs * 28) / 44);
      el.style.setProperty(
        "--hub-hero-title-size",
        "clamp(" + hhsMin + "px, 5vw, " + hhs + "px)"
      );
      el.style.setProperty(
        "--hub-hero-to-subnav-gap",
        (d.hubHeroToSubnavGap != null ? d.hubHeroToSubnavGap : 18) + "px"
      );
      var sns = d.hubSubnavSize != null ? d.hubSubnavSize : 15;
      var snsMin = Math.max(10, Math.round((sns * 11) / 15));
      el.style.setProperty(
        "--hub-subnav-size",
        "clamp(" + snsMin + "px, 1.2vw, " + sns + "px)"
      );
      el.style.setProperty(
        "--hub-subnav-gap",
        (d.hubSubnavGap != null ? d.hubSubnavGap : 28) + "px"
      );
      el.style.setProperty("--hub-intro-gap", d.hubIntroGap + "px");
      el.style.setProperty("--hub-section-gap", d.hubSectionGap + "px");
      el.style.setProperty("--hub-title-to-line-gap", d.hubTitleToLineGap + "px");
      el.style.setProperty("--hub-line-to-thumb-gap", d.hubLineToThumbGap + "px");
      el.style.setProperty(
        "--hub-section-title-size",
        "clamp(" +
          Math.max(14, d.titleSize - 2) +
          "px, 2.4vw, " +
          d.titleSize +
          "px)"
      );
      el.style.setProperty("--grid-card-title-size", d.cardTitleSize + "px");
      el.style.setProperty("--grid-card-desc-size", d.cardDescSize + "px");
    }

    if (pid === "contact" && d.contactHeroBrandSize != null) {
      el.style.setProperty("--contact-hero-brand-size", d.contactHeroBrandSize + "px");
      el.style.setProperty("--contact-hero-title-size", d.contactHeroTitleSize + "px");
      el.style.setProperty("--contact-info-size", d.contactInfoSize + "px");
      el.style.setProperty("--contact-label-size", d.contactLabelSize + "px");
    }

    if (pid === "partners" && d.partnerLogoHeight != null) {
      el.style.setProperty("--partner-logo-height", d.partnerLogoHeight + "px");
      el.style.setProperty(
        "--partner-logo-max-width",
        (d.partnerLogoMaxWidth != null ? d.partnerLogoMaxWidth : 260) + "px"
      );
      el.style.setProperty(
        "--partner-caption-size",
        (d.partnerCaptionSize != null ? d.partnerCaptionSize : 12) + "px"
      );
    }
  }

  function detectDesignPageId() {
    var body = document.body;
    if (body) {
      var attr = body.getAttribute("data-design-page");
      if (attr) return attr;
    }
    var file = (location.pathname || "").split("/").pop() || "index.html";
    if (file === "" || file === "index.html") return "index";
    return file.replace(/\.html$/i, "");
  }

  function getDesignForPage(pageId, store) {
    var s = store || load();
    var id = pageId || detectDesignPageId();
    if (ARTIST_LAYOUT_SYNC_TARGETS[id]) {
      if (s.designPages && s.designPages[ARTIST_LAYOUT_SYNC_SOURCE]) {
        return normalizeDesign(
          s.designPages[ARTIST_LAYOUT_SYNC_SOURCE],
          ARTIST_LAYOUT_SYNC_SOURCE
        );
      }
      if (DESIGN_PAGE_DEFAULTS[ARTIST_LAYOUT_SYNC_SOURCE]) {
        return normalizeDesign(
          DESIGN_PAGE_DEFAULTS[ARTIST_LAYOUT_SYNC_SOURCE],
          ARTIST_LAYOUT_SYNC_SOURCE
        );
      }
    }
    if (s.designPages && s.designPages[id]) {
      return normalizeDesign(s.designPages[id], id);
    }
    if (id === "index" && s.design) {
      return normalizeDesign(s.design, "index");
    }
    if (DESIGN_PAGE_DEFAULTS[id]) {
      return normalizeDesign(DESIGN_PAGE_DEFAULTS[id], id);
    }
    return normalizeDesign(DESIGN_DEFAULT, id);
  }

  function safeSocialUrl(url, fallback) {
    var u = String(url || "").trim();
    if (!u) return fallback || "";
    if (/^javascript:/i.test(u)) return fallback || "";
    if (/^data:/i.test(u)) return fallback || "";
    if (!/^https?:\/\//i.test(u)) {
      u = "https://" + u.replace(/^\/+/, "");
    }
    return u;
  }

  function normalize(raw) {
    if (!raw || typeof raw !== "object") {
      return {
        logoUrl: DEFAULT.logoUrl,
        aboutHeroUrl: DEFAULT.aboutHeroUrl,
        youtubeUrl: DEFAULT.youtubeUrl,
        instagramUrl: DEFAULT.instagramUrl,
        naverUrl: DEFAULT.naverUrl,
        design: Object.assign({}, DESIGN_DEFAULT),
        designPages: {},
      };
    }
    var logo = String(raw.logoUrl || "").trim();
    if (/^javascript:/i.test(logo)) logo = "";
    if (/^data:/i.test(logo) && !/^data:image\//i.test(logo)) logo = "";
    var aboutHero = String(raw.aboutHeroUrl || "").trim();
    if (/^javascript:/i.test(aboutHero)) aboutHero = "";
    if (/^data:/i.test(aboutHero) && !/^data:image\//i.test(aboutHero)) {
      aboutHero = "";
    }

    var designPages = normalizeDesignPages(raw.designPages);
    var legacyDesign = normalizeDesign(raw.design || DESIGN_DEFAULT, "index");
    if (!designPages.index && raw.design) {
      designPages.index = legacyDesign;
    }

    return {
      logoUrl: logo,
      aboutHeroUrl: aboutHero,
      youtubeUrl: safeSocialUrl(raw.youtubeUrl, DEFAULT.youtubeUrl),
      instagramUrl: safeSocialUrl(raw.instagramUrl, DEFAULT.instagramUrl),
      naverUrl: safeSocialUrl(raw.naverUrl, DEFAULT.naverUrl),
      design: designPages.index || legacyDesign,
      designPages: designPages,
    };
  }

  function siteSettingsScore(s) {
    if (!s) return 0;
    var n = 0;
    if (s.logoUrl) n += s.logoUrl.indexOf("data:") === 0 ? 24 : 3;
    if (s.aboutHeroUrl) n += s.aboutHeroUrl.indexOf("data:") === 0 ? 24 : 3;
    if (s.youtubeUrl) n += 1;
    if (s.instagramUrl) n += 1;
    if (s.naverUrl) n += 1;
    if (s.designPages && Object.keys(s.designPages).length) n += 4;
    return n;
  }

  function pickRicherSiteSettings(a, b) {
    var aS = siteSettingsScore(a);
    var bS = siteSettingsScore(b);
    if (aS !== bS) return aS > bS ? normalize(a) : normalize(b);
    try {
      return JSON.stringify(a).length >= JSON.stringify(b).length
        ? normalize(a)
        : normalize(b);
    } catch (e) {
      return normalize(b);
    }
  }

  function loadFromLocalStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return normalize(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  function load() {
    var fromLs = loadFromLocalStorage();
    if (!bundledSiteSettings && !fromLs) return normalize(DEFAULT);
    if (!bundledSiteSettings) return fromLs;
    if (!fromLs) return bundledSiteSettings;
    return pickRicherSiteSettings(fromLs, bundledSiteSettings);
  }

  function whenSiteReady(fn) {
    if (siteSettingsReady) {
      fn();
      return;
    }
    siteReadyQueue.push(fn);
  }

  function exportDeploySiteSettings(store) {
    return JSON.stringify(normalize(store || DEFAULT), null, 2);
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(data)));
  }

  function resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function applyAboutPage(s) {
    var hero = document.getElementById("about-hero-img");
    if (hero) {
      var heroUrl = String(s.aboutHeroUrl || "").trim();
      hero.src = heroUrl || "img/about-video-poster.png";
    }

    var brandImg = document.getElementById("about-brand-logo");
    var brandFallback = document.querySelector(".about-brand__fallback");
    if (brandImg && brandFallback) {
      if (s.logoUrl) {
        brandImg.src = s.logoUrl;
        brandImg.removeAttribute("hidden");
        brandFallback.setAttribute("hidden", "");
        brandFallback.setAttribute("aria-hidden", "true");
      } else {
        brandImg.removeAttribute("src");
        brandImg.setAttribute("hidden", "");
        brandFallback.removeAttribute("hidden");
        brandFallback.removeAttribute("aria-hidden");
      }
    }
  }

  function applySocialLink(label, url) {
    var links = document.querySelectorAll(
      'a.social__link[aria-label="' + label + '"]'
    );
    var fallback = defaultSocialUrl(label);
    links.forEach(function (a) {
      var inFooter = !!a.closest(".site-footer__social");
      var finalUrl = url || (inFooter ? fallback : "");
      if (finalUrl) {
        a.href = finalUrl;
        a.removeAttribute("hidden");
        a.removeAttribute("aria-hidden");
        return;
      }
      if (inFooter && fallback) {
        a.href = fallback;
        a.removeAttribute("hidden");
        a.removeAttribute("aria-hidden");
        return;
      }
      a.setAttribute("href", "#");
      a.setAttribute("hidden", "");
      a.setAttribute("aria-hidden", "true");
    });
  }

  function applyToDocument() {
    var s = load();
    var pageId = detectDesignPageId();
    applyDesignTokens(document.documentElement, getDesignForPage(pageId, s), pageId);
    applySocialLink("YouTube", s.youtubeUrl);
    applySocialLink("Instagram", s.instagramUrl);
    applySocialLink("Naver Blog", s.naverUrl);
    if (pageId === "about" || document.querySelector(".page-about")) {
      applyAboutPage(s);
    }

    var header = document.querySelector(".site-header");
    if (!header) return;

    var img = header.querySelector(".logo__image");
    var fb = header.querySelector(".logo__fallback");

    if (img && fb) {
      var linkEl = img.closest("a.logo");
      if (s.logoUrl) {
        img.src = s.logoUrl;
        img.removeAttribute("hidden");
        fb.setAttribute("hidden", "");
        fb.setAttribute("aria-hidden", "true");
        if (linkEl) linkEl.classList.add("logo--custom");
      } else {
        img.removeAttribute("src");
        img.setAttribute("hidden", "");
        fb.removeAttribute("hidden");
        fb.removeAttribute("aria-hidden");
        if (linkEl) linkEl.classList.remove("logo--custom");
      }
      return;
    }

    var logoLink = header.querySelector("a.logo");
    if (!logoLink) return;

    var mark = logoLink.querySelector(".logo__mark");
    if (!mark) return;

    var textEl = logoLink.querySelector(".logo__text");
    var customImg = logoLink.querySelector("img.logo__image");

    if (s.logoUrl) {
      logoLink.classList.add("logo--custom");
      if (!customImg) {
        customImg = document.createElement("img");
        customImg.className = "logo__image";
        customImg.setAttribute("alt", "");
        logoLink.insertBefore(customImg, logoLink.firstChild);
      }
      customImg.src = s.logoUrl;
      customImg.removeAttribute("hidden");
      mark.setAttribute("hidden", "");
      mark.setAttribute("aria-hidden", "true");
      if (textEl) {
        textEl.setAttribute("hidden", "");
      }
    } else {
      logoLink.classList.remove("logo--custom");
      if (customImg) {
        customImg.remove();
      }
      mark.removeAttribute("hidden");
      mark.removeAttribute("aria-hidden");
      if (textEl) {
        textEl.removeAttribute("hidden");
      }
    }
  }

  function initDesignPreviewListener() {
    window.addEventListener("message", function (e) {
      if (!e.data || e.data.type !== "waves-design-preview") return;
      applyDesignTokens(
        document.documentElement,
        e.data.design,
        e.data.pageId || detectDesignPageId()
      );
    });
  }

  initDesignPreviewListener();

  function bootSiteSettings() {
    if (typeof fetch !== "function") {
      siteSettingsReady = true;
      siteReadyQueue.splice(0).forEach(function (fn) {
        fn();
      });
      return;
    }
    fetch(
      SITE_DATA_URL +
        (SITE_DEPLOY_REV
          ? "?v=" + encodeURIComponent(SITE_DEPLOY_REV)
          : ""),
      { cache: "no-store" }
    )
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (raw) {
        bundledSiteSettings = raw ? normalize(raw) : null;
      })
      .catch(function () {
        bundledSiteSettings = null;
      })
      .finally(function () {
        siteSettingsReady = true;
        var queue = siteReadyQueue.splice(0);
        queue.forEach(function (fn) {
          fn();
        });
      });
  }

  bootSiteSettings();

  window.WavesSiteSettings = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT: DEFAULT,
    DESIGN_DEFAULT: DESIGN_DEFAULT,
    DESIGN_PAGE_DEFAULTS: DESIGN_PAGE_DEFAULTS,
    DESIGN_PAGE_LIST: DESIGN_PAGE_LIST,
    load: load,
    save: save,
    resetToDefaults: resetToDefaults,
    applyToDocument: applyToDocument,
    applyDesignTokens: applyDesignTokens,
    normalize: normalize,
    normalizeDesign: normalizeDesign,
    getDesignForPage: getDesignForPage,
    detectDesignPageId: detectDesignPageId,
    isHubDesignPage: isHubDesignPage,
    whenSiteReady: whenSiteReady,
    exportDeploySiteSettings: exportDeploySiteSettings,
    SITE_DATA_URL: SITE_DATA_URL,
  };
})();
