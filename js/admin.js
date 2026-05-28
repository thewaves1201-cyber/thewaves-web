(function () {
  "use strict";

  var SESSION_KEY = "waves_admin_ok";
  var PLACEHOLDER_IMG =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  var loginScreen = document.getElementById("login-screen");
  var loginForm = document.getElementById("login-form");
  var adminPanel = document.getElementById("admin-panel");
  var galleriesRoot = document.getElementById("galleries-root");
  var siteSettingsRoot = document.getElementById("site-settings-root");
  var msgEl = document.getElementById("admin-message");
  var btnSave = document.getElementById("btn-save");
  var btnRecompressHq = document.getElementById("btn-recompress-hq");
  var btnReset = document.getElementById("btn-reset");
  var btnExport = document.getElementById("btn-export");
  var btnExportDeploy = document.getElementById("btn-export-deploy");
  var importFile = document.getElementById("import-file");
  var loginError = document.getElementById("login-error");

  var liveStore = null;
  var currentPageId = "index";
  var selection = { sectionId: null, index: -1 };
  var dragSource = null;

  function imageCompress() {
    return window.WavesImageCompress || null;
  }

  function getSectionVariant(sectionId) {
    var pageCfg = getCurrentPageConfig();
    if (!pageCfg || !pageCfg.sections) return "";
    for (var i = 0; i < pageCfg.sections.length; i++) {
      if (pageCfg.sections[i].id === sectionId) {
        return pageCfg.sections[i].variant || "";
      }
    }
    return "";
  }

  function getPageSectionVariant(pageId, sectionId) {
    var pages = window.WavesGallery && window.WavesGallery.ADMIN_PAGE_LIST;
    if (!pages) return "";
    for (var i = 0; i < pages.length; i++) {
      var p = pages[i];
      if (p.id !== pageId || !p.sections) continue;
      for (var j = 0; j < p.sections.length; j++) {
        if (p.sections[j].id === sectionId) {
          return p.sections[j].variant || "";
        }
      }
    }
    return "";
  }

  function isPartnerLogoSection(pageId, sectionId) {
    return getPageSectionVariant(pageId, sectionId) === "partner";
  }

  function compressOptsForSection(pageId, sectionId, file) {
    if (isPartnerLogoSection(pageId, sectionId)) {
      return compressOptsLogo(file);
    }
    var variant = getPageSectionVariant(pageId, sectionId);
    if (sectionId === "hero" || variant === "hero") {
      return { maxDimension: 3840, quality: 0.92 };
    }
    if (variant === "wide") {
      return { maxDimension: 1800, quality: 0.84 };
    }
    if (variant === "square" || variant === "portrait") {
      return { maxDimension: 1400, quality: 0.82 };
    }
    return { maxDimension: 1600, quality: 0.82 };
  }

  function compressOptsHighQuality(pageId, sectionId, file) {
    var o = compressOptsForSection(pageId, sectionId, file);
    o.preferQuality = true;
    return o;
  }

  function compressOptsAggressive(pageId, sectionId) {
    if (isPartnerLogoSection(pageId, sectionId)) {
      return compressOptsLogo();
    }
    var variant = getPageSectionVariant(pageId, sectionId);
    if (sectionId === "hero" || variant === "hero") {
      return { maxDimension: 2560, quality: 0.82 };
    }
    if (variant === "wide") {
      return { maxDimension: 1400, quality: 0.72 };
    }
    return { maxDimension: 1200, quality: 0.68 };
  }

  function compressOptsEmergency(pageId, sectionId) {
    if (isPartnerLogoSection(pageId, sectionId)) {
      return {
        maxDimension: 560,
        quality: 0.88,
        preservePng: true,
        backgroundColor: logoCompressBg(),
      };
    }
    if (sectionId === "hero") {
      return { maxDimension: 1024, quality: 0.58 };
    }
    return { maxDimension: 640, quality: 0.55 };
  }

  function logoCompressBg() {
    return (
      (window.WavesImageCompress && window.WavesImageCompress.SITE_BG_FILL) ||
      "#1c1c1c"
    );
  }

  function compressOptsLogo(file) {
    return {
      maxDimension: 1200,
      quality: 0.92,
      preservePng: true,
      backgroundColor: logoCompressBg(),
    };
  }

  function isQuotaError(err) {
    return (
      err &&
      (err.code === 22 || err.code === 1014 || err.name === "QuotaExceededError")
    );
  }

  function forEachStoreDataImage(store, visit, done) {
    if (!store || !store.pages) {
      done();
      return;
    }
    var tasks = [];
    Object.keys(store.pages).forEach(function (pageId) {
      var page = store.pages[pageId];
      if (!page || typeof page !== "object") return;
      Object.keys(page).forEach(function (sectionId) {
        var list = page[sectionId];
        if (!Array.isArray(list)) return;
        list.forEach(function (item) {
          if (
            item &&
            item.image &&
            imageCompress() &&
            imageCompress().isDataImage(item.image)
          ) {
            tasks.push({ item: item, pageId: pageId, sectionId: sectionId });
          }
        });
      });
    });
    var i = 0;
    function next() {
      if (i >= tasks.length) {
        done();
        return;
      }
      var t = tasks[i++];
      visit(t.item, t.pageId, t.sectionId, next);
    }
    next();
  }

  function compressGalleryStore(mode, done) {
    var IC = imageCompress();
    if (!IC || !liveStore) {
      done();
      return;
    }
    var pickOpts =
      mode === "emergency"
        ? compressOptsEmergency
        : mode === "aggressive"
          ? compressOptsAggressive
          : mode === "highquality"
            ? compressOptsHighQuality
            : compressOptsForSection;
    forEachStoreDataImage(
      liveStore,
      function (item, pageId, sectionId, next) {
        IC.compressDataUrl(
          item.image,
          pickOpts(pageId, sectionId),
          function (_err, url) {
            if (url) item.image = url;
            next();
          }
        );
      },
      done
    );
  }

  function compressLogoPreview(done, highQuality) {
    var IC = imageCompress();
    var prev = document.getElementById("site-logo-preview");
    if (!IC || !prev || !IC.isDataImage(prev.src)) {
      done();
      return;
    }
    var logoOpts = Object.assign(compressOptsLogo(), {
      preservePng: /image\/png/i.test(prev.src),
    });
    if (highQuality) logoOpts.preferQuality = true;
    IC.compressDataUrl(prev.src, logoOpts, function (_err, url) {
      if (url) prev.src = url;
      done();
    });
  }

  function updateStorageMeter() {
    var el = document.getElementById("admin-storage-meter");
    var IC = imageCompress();
    if (!el || !IC) return;
  function renderMeter(info) {
      var used = info.used || 0;
      var quota = info.quota || IC.STORAGE_DISPLAY_QUOTA_BYTES;
      var pct = quota ? Math.min(100, Math.round((used / quota) * 100)) : 0;
      var warn = used >= quota * 0.85;
      var idbNote = window.WavesGalleryDB
        ? " (갤러리 IndexedDB · 로고 등 " + IC.formatBytes(info.local || 0) + ")"
        : "";
      el.className =
        "admin-storage-meter" + (warn ? " admin-storage-meter--warn" : "");
      el.innerHTML =
        "<span>저장 사용량</span> " +
        "<strong>" +
        IC.formatBytes(used) +
        "</strong> / 약 " +
        IC.formatBytes(quota) +
        idbNote +
        ' <span class="admin-storage-meter__bar" aria-hidden="true">' +
        '<span class="admin-storage-meter__fill" style="width:' +
        pct +
        '%"></span></span>';
      if (warn) {
        el.innerHTML +=
          '<p class="admin-storage-meter__tip">용량이 큽니다. 저장 시 이미지가 자동으로 줄어듭니다. JSON보내기로 백업해 두는 것을 권장합니다.</p>';
      } else if (window.WavesGalleryDB) {
        el.innerHTML +=
          '<p class="admin-storage-meter__tip">갤러리 데이터는 localStorage(약 5MB) 대신 IndexedDB에 저장되어 용량이 넉넉합니다.</p>';
      }
    }
    if (IC.estimateSiteStorageUsage) {
      IC.estimateSiteStorageUsage(function (_err, info) {
        renderMeter(info || { used: IC.estimateLocalStorageUsage(), quota: IC.STORAGE_DISPLAY_QUOTA_BYTES });
      });
      return;
    }
    renderMeter({
      used: IC.estimateLocalStorageUsage(),
      quota: IC.STORAGE_LIMIT_BYTES,
    });
  }

  function getPassword() {
    return String(window.WAVES_ADMIN_PASSWORD || "");
  }

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function setLoggedIn() {
    sessionStorage.setItem(SESSION_KEY, "1");
  }

  function showMessage(text, kind) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = "admin-msg admin-msg--" + (kind || "ok");
    msgEl.classList.remove("admin-hidden");
    window.setTimeout(function () {
      msgEl.classList.add("admin-hidden");
    }, 5000);
  }

  function showLoginError(text) {
    if (!loginError) return;
    loginError.textContent = text;
    loginError.classList.remove("admin-hidden");
  }

  function hideLoginError() {
    if (loginError) loginError.classList.add("admin-hidden");
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function getPageMeta() {
    return window.WavesGallery.ADMIN_PAGE_LIST || [];
  }

  function initLiveStore() {
    liveStore = window.WavesGallery.loadRaw();
  }

  function getCurrentPageConfig() {
    return getPageMeta().find(function (p) {
      return p.id === currentPageId;
    });
  }

  function getSectionList(sectionId) {
    if (!liveStore || !liveStore.pages[currentPageId]) return [];
    var arr = liveStore.pages[currentPageId][sectionId];
    return Array.isArray(arr) ? arr : [];
  }

  function setSectionList(sectionId, list) {
    if (!liveStore.pages[currentPageId]) liveStore.pages[currentPageId] = {};
    liveStore.pages[currentPageId][sectionId] = list.map(window.WavesGallery.normalizeItem);
  }

  function itemHasThumb(item) {
    if (window.WavesGallery && window.WavesGallery.hasGalleryImage) {
      return window.WavesGallery.hasGalleryImage(item);
    }
    var u = (item && item.image) || "";
    return !!String(u).trim();
  }

  function thumbSrc(item, sectionId) {
    var isPartner =
      sectionId && getSectionVariant(sectionId) === "partner";
    if (!itemHasThumb(item)) {
      return isPartner ? "" : PLACEHOLDER_IMG;
    }
    return String(item.image || "").trim();
  }

  function clearSelection() {
    selection = { sectionId: null, index: -1 };
    renderDock();
    document.querySelectorAll(".admin-tile--selected").forEach(function (el) {
      el.classList.remove("admin-tile--selected");
    });
  }

  function selectTile(sectionId, index) {
    selection = { sectionId: sectionId, index: index };
    document.querySelectorAll(".admin-tile--selected").forEach(function (el) {
      el.classList.remove("admin-tile--selected");
    });
    var tile = galleriesRoot.querySelector(
      '.admin-tile[data-section="' + sectionId + '"][data-index="' + index + '"]'
    );
    if (tile) tile.classList.add("admin-tile--selected");
    renderDock();
    var dockEl = document.getElementById("gallery-edit-dock");
    if (dockEl && getSelectedItem()) {
      window.requestAnimationFrame(function () {
        dockEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }

  function getSelectedItem() {
    if (selection.sectionId == null || selection.index < 0) return null;
    var list = getSectionList(selection.sectionId);
    return list[selection.index] || null;
  }

  function syncDockField(name, value) {
    if (selection.sectionId == null || selection.index < 0) return;
    var list = getSectionList(selection.sectionId);
    var item = list[selection.index];
    if (!item) return;
    if (name === "showPlay") {
      item.showPlay = !!value;
    } else {
      item[name] = value;
    }
    list[selection.index] = window.WavesGallery.normalizeItem(item);
    var tile = galleriesRoot.querySelector(
      '.admin-tile[data-section="' +
        selection.sectionId +
        '"][data-index="' +
        selection.index +
        '"]'
    );
    if (tile) {
      var sec = selection.sectionId;
      var src = thumbSrc(list[selection.index], sec);
      var isPartner = getSectionVariant(sec) === "partner";
      var idxEl = tile.querySelector(".admin-tile__idx");
      if (src) {
        tile.classList.remove("admin-tile--empty");
        var ph = tile.querySelector(".admin-tile__ph");
        if (ph) ph.remove();
        var img = tile.querySelector(".admin-tile__img");
        if (!img) {
          img = document.createElement("img");
          img.className = "admin-tile__img";
          img.alt = "";
          tile.insertBefore(img, idxEl);
        }
        img.src = src;
        img.hidden = false;
      } else if (isPartner) {
        tile.classList.add("admin-tile--empty");
        var imgRm = tile.querySelector(".admin-tile__img");
        if (imgRm) imgRm.remove();
        if (!tile.querySelector(".admin-tile__ph")) {
          var phNew = document.createElement("span");
          phNew.className = "admin-tile__ph";
          phNew.setAttribute("aria-hidden", "true");
          tile.insertBefore(phNew, idxEl);
        }
      } else {
        var imgFallback = tile.querySelector(".admin-tile__img");
        if (imgFallback) imgFallback.src = PLACEHOLDER_IMG;
      }
    }
    var prev = document.getElementById("dock-img-preview");
    var prevEmpty = document.getElementById("dock-img-preview-empty");
    var secId = selection.sectionId;
    var dockSrc = thumbSrc(list[selection.index], secId);
    if (prev) {
      if (dockSrc) {
        prev.src = dockSrc;
        prev.hidden = false;
        if (prevEmpty) prevEmpty.hidden = true;
      } else {
        prev.removeAttribute("src");
        prev.hidden = true;
        if (prevEmpty) prevEmpty.hidden = false;
      }
    }
  }

  function escapeHtmlSimple(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderDock() {
    var dock = document.getElementById("gallery-edit-dock");
    if (!dock) return;
    var item = getSelectedItem();
    if (!item) {
      dock.className = "admin-dock admin-dock--empty";
      dock.innerHTML =
        '<p class="admin-dock__lead">갤러리 그리드 <strong>아래</strong>에서 항목을 선택하면 이 패널에 제목·링크 등이 표시됩니다.</p>' +
        '<p class="admin-dock__hint">순서는 카드를 드래그해 바꿉니다. 이미지는 파일로 올리거나 URL을 직접 입력할 수 있습니다.</p>';
      return;
    }
    dock.className = "admin-dock";
    var isHero = selection.sectionId === "hero";
    var isPartner = getSectionVariant(selection.sectionId) === "partner";
    var titleField = isHero
      ? '<div class="admin-field admin-field--wide">' +
        "<label for=\"dock-title\">큰 제목 (줄바꿈 = 새 줄 · Enter)</label>" +
        '<textarea id="dock-title" class="admin-dock__textarea" rows="3">' +
        escapeHtmlSimple(item.title || "") +
        "</textarea></div>"
      : isPartner
        ? ""
        : '<div class="admin-field">' +
          "<label>제목</label>" +
          '<input type="text" id="dock-title" value="' +
          escapeAttr(item.title || "") +
          '" />' +
          "</div>";
    var descField = isHero
      ? '<div class="admin-field admin-field--wide">' +
        "<label for=\"dock-description\">한 줄 소개 (부제, 줄바꿈 가능)</label>" +
        '<textarea id="dock-description" class="admin-dock__textarea" rows="2">' +
        escapeHtmlSimple(item.description || "") +
        "</textarea></div>"
      : '<div class="admin-field">' +
        "<label>" +
        (isPartner ? "로고 아래 글자 (회사명)" : "소제목/설명") +
        "</label>" +
        '<input type="text" id="dock-description" value="' +
        escapeAttr(item.description || item.title || "") +
        '" placeholder="' +
        (isPartner ? "예: SK telecom" : "") +
        '" />' +
        "</div>";
    var eyebrowPlay =
      isHero || isPartner
        ? ""
        : '<div class="admin-field">' +
          "<label>Eyebrow (엔터테인먼트용)</label>" +
          '<input type="text" id="dock-eyebrow" value="' +
          escapeAttr(item.eyebrow || "") +
          '" placeholder="비워두면 숨김" />' +
          "</div>";
    var partnerHint = isPartner
      ? '<p class="admin-hint" style="margin:0 0 12px">투명 PNG에 <strong>흰색 로고</strong>만 있는 파일을 올리세요 (흰 사각 배경 X). 각 칸마다 이미지가 있어야 하며, 저장 후 partners 페이지에서 확인하세요.</p>'
      : "";
    var hrefField = isPartner
      ? ""
      : '<div class="admin-field admin-field--wide">' +
        "<label>클릭 시 이동할 URL</label>" +
        '<input type="text" id="dock-href" value="' +
        escapeAttr(item.href || "") +
        '" placeholder="https://www.youtube.com/watch?v=…" />' +
        '<p class="admin-hint" style="margin:6px 0 0">YouTube 동영상 주소(watch?v=, youtu.be 등)를 넣으면 재생 아이콘이 표시되고, 사이트 안에서 재생됩니다.</p>' +
        "</div>";
    var dockThumb = thumbSrc(item, selection.sectionId);
    var dockHasImg = !!dockThumb;
    dock.innerHTML =
      '<div class="admin-dock__grid">' +
      '<div class="admin-dock__preview' +
      (isPartner ? " admin-dock__preview--partner" : "") +
      '">' +
      (dockHasImg
        ? '<img id="dock-img-preview" src="' +
          escapeAttr(dockThumb) +
          '" alt="" />'
        : '<img id="dock-img-preview" alt="" hidden />') +
      '<span id="dock-img-preview-empty" class="admin-dock__preview-empty"' +
      (dockHasImg ? ' hidden' : "") +
      ">로고 없음</span>" +
      '<div class="admin-dock__file-row">' +
      '<label class="admin-btn admin-btn--sm"><input type="file" id="dock-file-image" accept="image/*" class="admin-hidden" />' +
      (isPartner ? "로고 파일 (PNG)" : "이미지 파일") +
      "</label>" +
      "</div>" +
      "</div>" +
      '<div class="admin-dock__fields">' +
      partnerHint +
      '<div class="admin-field admin-field--wide">' +
      "<label>" +
      (isPartner ? "로고 이미지 URL (선택)" : "이미지 URL (선택, 파일 대신)") +
      "</label>" +
      '<input type="text" id="dock-image-url" value="' +
      escapeAttr(
        item.image && item.image.indexOf("data:") === 0 ? "" : item.image || ""
      ) +
      '" placeholder="https://… 또는 비워두고 파일만 사용" />' +
      "</div>" +
      hrefField +
      titleField +
      descField +
      eyebrowPlay +
      '<div class="admin-dock__actions">' +
      '<button type="button" class="admin-btn admin-btn--danger" id="dock-delete">이 슬라이드 삭제</button>' +
      "</div>" +
      "</div>" +
      "</div>";
  }

  function isHeroSection(pageId, sectionId) {
    return (
      sectionId === "hero" || getPageSectionVariant(pageId, sectionId) === "hero"
    );
  }

  function afterImageUploadMessage(pageId, sectionId, dataUrl) {
    if (!isHeroSection(pageId, sectionId)) {
      showMessage("이미지를 업로드용 크기로 줄였습니다.", "ok");
      return;
    }
    var probe = new Image();
    probe.onload = function () {
      var w = probe.naturalWidth || 0;
      var h = probe.naturalHeight || 0;
      if (w < 1920) {
        showMessage(
          "히어로는 가로 1920px 이상 원본을 권장합니다. 지금 " +
            w +
            "×" +
            h +
            "px — 전체 화면에서 흐려 보일 수 있습니다. 원본 파일로 다시 올려 주세요.",
          "err"
        );
      } else {
        showMessage(
          "히어로 이미지 준비됨 (" + w + "×" + h + "px). [저장] 후 배포용 파일보내기 하세요.",
          "ok"
        );
      }
    };
    probe.onerror = function () {
      showMessage("히어로 이미지를 올렸습니다. [저장]을 눌러 주세요.", "ok");
    };
    probe.src = dataUrl;
  }

  function fileToDataUrl(file, opts, done) {
    if (typeof opts === "function") {
      done = opts;
      opts = null;
    }
    if (!file || !/^image\//i.test(file.type)) {
      showMessage("이미지 파일만 올릴 수 있습니다.", "err");
      return;
    }
    var IC = imageCompress();
    if (IC) {
      IC.compressFile(file, opts || {}, function (err, dataUrl) {
        if (err || !dataUrl) {
          showMessage("이미지를 처리하지 못했습니다.", "err");
          return;
        }
        done(dataUrl);
      });
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      done(reader.result || "");
    };
    reader.onerror = function () {
      showMessage("파일을 읽지 못했습니다.", "err");
    };
    reader.readAsDataURL(file);
  }

  function renderSectionBlock(pageCfg, sec) {
    var items = getSectionList(sec.id);
    var tiles = items
      .map(function (it, i) {
        var src = thumbSrc(it, sec.id);
        var hasImg = !!src;
        var tileClass = "admin-tile";
        if (!hasImg && sec.variant === "partner") {
          tileClass += " admin-tile--empty";
        }
        return (
          '<div class="' +
          tileClass +
          '" draggable="true" data-section="' +
          escapeAttr(sec.id) +
          '" data-index="' +
          i +
          '">' +
          '<span class="admin-tile__grip" title="드래그하여 순서 변경" aria-hidden="true">⋮⋮</span>' +
          (hasImg
            ? '<img class="admin-tile__img" src="' +
              escapeAttr(src) +
              '" alt="" />'
            : '<span class="admin-tile__ph" aria-hidden="true"></span>') +
          '<span class="admin-tile__idx">' +
          (i + 1) +
          "</span>" +
          '<button type="button" class="admin-tile__del" data-section="' +
          escapeAttr(sec.id) +
          '" data-index="' +
          i +
          '" title="삭제">×</button>' +
          "</div>"
        );
      })
      .join("");

    var addLabel =
      sec.variant === "hero"
        ? "+ 슬라이드 추가"
        : sec.variant === "partner"
          ? "+ 파트너 추가"
          : "+ 이미지 추가";
    var blockClass = "admin-gallery-block";
    if (sec.variant === "partner") blockClass += " admin-gallery-block--partner";

    return (
      '<section class="' +
      blockClass +
      '" data-section="' +
      escapeAttr(sec.id) +
      '">' +
      "<h4>" +
      escapeAttr(sec.title) +
      "</h4>" +
      '<div class="admin-grid" data-section="' +
      escapeAttr(sec.id) +
      '">' +
      tiles +
      "</div>" +
      '<button type="button" class="admin-btn admin-btn--ghost add-gallery-item" data-section="' +
      escapeAttr(sec.id) +
      '">' +
      addLabel +
      "</button>" +
      "</section>"
    );
  }

  function renderGalleriesEditor() {
    if (!galleriesRoot) return;
    selection = { sectionId: null, index: -1 };
    var pageCfg = getCurrentPageConfig();
    if (!pageCfg) return;

    var opts = getPageMeta()
      .map(function (p) {
        return (
          '<option value="' +
          escapeAttr(p.id) +
          '"' +
          (p.id === currentPageId ? " selected" : "") +
          ">" +
          escapeAttr(p.label) +
          "</option>"
        );
      })
      .join("");

    var blocks = pageCfg.sections.map(function (sec) {
      return renderSectionBlock(pageCfg, sec);
    }).join("");

    galleriesRoot.innerHTML =
      '<div class="admin-page-bar">' +
      "<label>페이지</label>" +
      '<select id="admin-page-select" class="admin-select">' +
      opts +
      "</select>" +
      '<p class="admin-page-bar__hint">' +
      (currentPageId === "partners"
        ? "<strong>PARTNERS</strong>는 칸마다 <strong>로고 이미지</strong>가 있어야 합니다. 그리드에서 항목을 하나씩 클릭 → <strong>로고 파일 (PNG)</strong> 업로드 → 상단 <strong>저장</strong>. 회사명은 「로고 아래 글자」에 입력하세요. admin과 partners 페이지는 같은 주소(<code>127.0.0.1:5500</code> 등)로 열어야 저장 내용이 보입니다."
        : "<strong>메인 (index)</strong>에서는 상단 <strong>히어로 슬라이드</strong>(큰 이미지·제목·한 줄 소개)만 편집합니다. 메인의 BRANDED / MEDIA / ENTERTAINMENT 띠는 각각 BRAND MARKETING · MEDIA CONTENTS · ENTERTAINMENT CONTENTS와 같은 데이터입니다. <strong>ARTIST MANAGEMENT</strong>·<strong>MUSIC PUBLISHING</strong>은 각각 전용 페이지에서 갤러리를 편집하며, <strong>MUSIC BUSINESS</strong> 페이지는 두 갤러리 미리보기만 표시합니다. 아티스트 5인 페이지는 각각 ALBUM + LIVE CLIP입니다.") +
      "</p>" +
      "</div>" +
      blocks;

    var dock = document.createElement("div");
    dock.id = "gallery-edit-dock";
    dock.className = "admin-dock admin-dock--empty";
    galleriesRoot.appendChild(dock);

    renderDock();
    bindDockInputs();
    document.getElementById("admin-page-select").addEventListener("change", function () {
      currentPageId = this.value;
      renderGalleriesEditor();
    });
  }

  function bindDockInputs() {
    var dock = document.getElementById("gallery-edit-dock");
    if (!dock) return;
    dock.addEventListener("input", function (e) {
      var t = e.target;
      if (!(t instanceof HTMLInputElement) && !(t instanceof HTMLTextAreaElement)) return;
      if (t.id === "dock-image-url") syncDockField("image", t.value.trim());
      else if (t.id === "dock-href") {
        var hrefVal = t.value.trim();
        syncDockField("href", hrefVal);
        var ytId =
          window.WavesGallery && window.WavesGallery.parseYouTubeId
            ? window.WavesGallery.parseYouTubeId(hrefVal)
            : "";
        syncDockField("showPlay", !!ytId);
      }
      else if (t.id === "dock-title") syncDockField("title", t.value);
      else if (t.id === "dock-description") syncDockField("description", t.value);
      else if (t.id === "dock-eyebrow") syncDockField("eyebrow", t.value);
    });
    dock.addEventListener("change", function (e) {
      var t = e.target;
      if (t instanceof HTMLInputElement && t.id === "dock-file-image" && t.files && t.files[0]) {
        var sec = selection.sectionId || "items";
        fileToDataUrl(
          t.files[0],
          compressOptsForSection(currentPageId, sec, t.files[0]),
          function (dataUrl) {
            syncDockField("image", dataUrl);
            var urlInp = document.getElementById("dock-image-url");
            if (urlInp) urlInp.value = "";
            t.value = "";
            if (getSectionVariant(sec) === "partner") {
              showMessage(
                "로고를 저장했습니다. 반드시 [저장] 버튼을 눌러 주세요.",
                "ok"
              );
              return;
            }
            afterImageUploadMessage(currentPageId, sec, dataUrl);
            showMessage(
              (msgEl && msgEl.textContent ? "" : "") +
                " 변경 후 반드시 상단 [저장]을 눌러야 index.html에 반영됩니다.",
              "ok"
            );
          }
        );
      }
    });
    dock.addEventListener("click", function (e) {
      if (e.target && e.target.id === "dock-delete") {
        var sec = selection.sectionId;
        var idx = selection.index;
        if (sec == null || idx < 0) return;
        var list = getSectionList(sec).slice();
        list.splice(idx, 1);
        setSectionList(sec, list);
        clearSelection();
        renderGalleriesEditor();
      }
    });
  }

  function reorderSection(sectionId, from, to) {
    var list = getSectionList(sectionId).slice();
    if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return;
    var item = list.splice(from, 1)[0];
    list.splice(to, 0, item);
    setSectionList(sectionId, list);
    if (selection.sectionId === sectionId) {
      if (selection.index === from) selection.index = to;
      else if (from < selection.index && to >= selection.index) selection.index--;
      else if (from > selection.index && to <= selection.index) selection.index++;
    }
  }

  function collectSiteData() {
    var logoInp = document.getElementById("site-logo-url");
    var ytInp = document.getElementById("site-youtube-url");
    var igInp = document.getElementById("site-instagram-url");
    var nvInp = document.getElementById("site-naver-url");
    var prev =
      window.WavesSiteSettings && window.WavesSiteSettings.load
        ? window.WavesSiteSettings.load()
        : { design: {} };
    var aboutHeroInp = document.getElementById("site-about-hero-url");
    return {
      logoUrl: logoInp && logoInp.value ? logoInp.value.trim() : "",
      aboutHeroUrl:
        aboutHeroInp && aboutHeroInp.value ? aboutHeroInp.value.trim() : "",
      youtubeUrl: ytInp && ytInp.value ? ytInp.value.trim() : "",
      instagramUrl: igInp && igInp.value ? igInp.value.trim() : "",
      naverUrl: nvInp && nvInp.value ? nvInp.value.trim() : "",
      design: prev.design,
      designPages: prev.designPages || {},
    };
  }

  function buildSitePayloadForSave() {
    var data = collectSiteData();
    var prev = document.getElementById("site-logo-preview");
    if (prev && prev.src && prev.src.indexOf("data:image") === 0 && !data.logoUrl) {
      data.logoUrl = prev.src;
    }
    var heroPrev = document.getElementById("site-about-hero-preview");
    if (
      heroPrev &&
      heroPrev.src &&
      heroPrev.src.indexOf("data:image") === 0 &&
      !data.aboutHeroUrl
    ) {
      data.aboutHeroUrl = heroPrev.src;
    }
    if (window.WavesSiteSettings && window.WavesSiteSettings.normalize) {
      return window.WavesSiteSettings.normalize(data);
    }
    return data;
  }

  function saveSnsLinksOnly() {
    if (!window.WavesSiteSettings) return;
    var prev = window.WavesSiteSettings.load();
    var collected = collectSiteData();
    var next = window.WavesSiteSettings.normalize({
      logoUrl: prev.logoUrl,
      aboutHeroUrl: prev.aboutHeroUrl,
      youtubeUrl: collected.youtubeUrl,
      instagramUrl: collected.instagramUrl,
      naverUrl: collected.naverUrl,
      design: prev.design,
      designPages: prev.designPages || {},
    });
    try {
      window.WavesSiteSettings.save(next);
      showMessage(
        "SNS 링크를 저장했습니다. 메인·서브 페이지를 새로고침하면 적용됩니다.",
        "ok"
      );
    } catch (err) {
      showMessage("SNS 링크 저장 중 오류가 났습니다.", "err");
    }
  }

  function renderSiteSettings() {
    var el = siteSettingsRoot;
    if (!el || !window.WavesSiteSettings) return;
    var s = window.WavesSiteSettings.load();
    var url = s.logoUrl || "";
    var heroUrl = s.aboutHeroUrl || "";
    var blank = PLACEHOLDER_IMG;
    el.innerHTML =
      '<section class="admin-section admin-section--site admin-section--sns" id="admin-sns-links">' +
      "<h3>SNS 링크</h3>" +
      '<p class="admin-hint" style="margin:0 0 12px">헤더·푸터의 YouTube·Instagram·네이버 아이콘을 눌렀을 때 이동할 주소입니다. 입력 후 <strong>SNS 링크 저장</strong> 또는 상단 <strong>저장</strong>을 누르고, 공개 페이지를 새로고침하세요.</p>' +
      '<div class="admin-field admin-field--wide">' +
      '<label for="site-youtube-url">YouTube</label>' +
      '<input type="url" id="site-youtube-url" value="' +
      escapeAttr(s.youtubeUrl || "") +
      '" placeholder="https://www.youtube.com/@…" autocomplete="url" />' +
      "</div>" +
      '<div class="admin-field admin-field--wide">' +
      '<label for="site-instagram-url">Instagram</label>' +
      '<input type="url" id="site-instagram-url" value="' +
      escapeAttr(s.instagramUrl || "") +
      '" placeholder="https://www.instagram.com/…" autocomplete="url" />' +
      "</div>" +
      '<div class="admin-field admin-field--wide">' +
      '<label for="site-naver-url">네이버 블로그</label>' +
      '<input type="url" id="site-naver-url" value="' +
      escapeAttr(s.naverUrl || "") +
      '" placeholder="https://blog.naver.com/…" autocomplete="url" />' +
      "</div>" +
      '<div class="admin-sns-actions">' +
      '<button type="button" class="admin-btn admin-btn--primary" id="btn-save-sns">SNS 링크 저장</button>' +
      "</div>" +
      "</section>" +
      '<section class="admin-section admin-section--site">' +
      "<h3>헤더 로고</h3>" +
      '<p class="admin-hint" style="margin:0 0 12px">PNG·SVG 등 투명 배경을 권장합니다. 파일을 올리면 이 브라우저에만 저장됩니다.</p>' +
      '<div class="admin-field admin-field--wide">' +
      '<label for="site-logo-url">로고 이미지 URL (선택)</label>' +
      '<input type="text" id="site-logo-url" value="' +
      escapeAttr(url && url.indexOf("data:") === 0 ? "" : url) +
      '" placeholder="https://… 또는 비우고 파일만 사용" />' +
      "</div>" +
      '<div class="admin-field">' +
      '<label class="admin-btn admin-btn--sm" style="cursor:pointer"><input type="file" id="site-logo-file" accept="image/*" class="admin-hidden" />로고 파일 올리기</label>' +
      "</div>" +
      '<div style="margin-top:14px">' +
      '<span style="display:block;margin-bottom:6px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--admin-muted)">미리보기</span>' +
      '<img id="site-logo-preview" class="admin-logo-preview" src="' +
      escapeAttr(url || blank) +
      '" alt="" />' +
      "</div>" +
      "</section>" +
      '<section class="admin-section admin-section--site">' +
      "<h3>ABOUT US 상단 사진</h3>" +
      '<p class="admin-hint" style="margin:0 0 12px">about.html 상단 대표 이미지 1장입니다. 16:9 비율을 권장합니다.</p>' +
      '<div class="admin-field admin-field--wide">' +
      '<label for="site-about-hero-url">이미지 URL (선택)</label>' +
      '<input type="text" id="site-about-hero-url" value="' +
      escapeAttr(heroUrl && heroUrl.indexOf("data:") === 0 ? "" : heroUrl) +
      '" placeholder="https://… 또는 비우고 파일만 사용" />' +
      "</div>" +
      '<div class="admin-field">' +
      '<label class="admin-btn admin-btn--sm" style="cursor:pointer"><input type="file" id="site-about-hero-file" accept="image/*" class="admin-hidden" />사진 파일 올리기</label>' +
      "</div>" +
      '<div style="margin-top:14px">' +
      '<span style="display:block;margin-bottom:6px;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--admin-muted)">미리보기</span>' +
      '<img id="site-about-hero-preview" class="admin-logo-preview" src="' +
      escapeAttr(heroUrl || "img/about-video-poster.png") +
      '" alt="" style="max-width:100%;aspect-ratio:16/9;object-fit:cover" />' +
      "</div>" +
      "</section>" +
      '<section class="admin-section admin-section--site">' +
      "<h3>디자인 · 간격</h3>" +
      '<p class="admin-hint" style="margin:0 0 12px">메인 페이지 섹션 여백·제목·캐러셀 글자 크기를 조절합니다. 오른쪽 미리보기로 확인할 수 있습니다.</p>' +
      '<a class="admin-btn admin-btn--primary" href="admin-design.html">디자인 편집 열기</a>' +
      "</section>";

    var lf = document.getElementById("site-logo-file");
    var urlInp = document.getElementById("site-logo-url");
    var prev = document.getElementById("site-logo-preview");
    if (lf && urlInp && prev) {
      lf.addEventListener("change", function () {
        var f = lf.files && lf.files[0];
        if (!f) return;
        fileToDataUrl(f, compressOptsLogo(f), function (d) {
          urlInp.value = "";
          prev.src = d;
          lf.value = "";
          showMessage("로고 이미지를 업로드용 크기로 줄였습니다.", "ok");
        });
      });
    }

    var hf = document.getElementById("site-about-hero-file");
    var heroInp = document.getElementById("site-about-hero-url");
    var heroPrev = document.getElementById("site-about-hero-preview");
    if (hf && heroInp && heroPrev) {
      hf.addEventListener("change", function () {
        var f = hf.files && hf.files[0];
        if (!f) return;
        fileToDataUrl(f, { maxDimension: 2560, quality: 0.88 }, function (d) {
          heroInp.value = "";
          heroPrev.src = d;
          hf.value = "";
          showMessage("ABOUT 상단 사진을 저장할 준비가 되었습니다.", "ok");
        });
      });
    }

    var btnSaveSns = document.getElementById("btn-save-sns");
    if (btnSaveSns) {
      btnSaveSns.addEventListener("click", saveSnsLinksOnly);
    }
  }

  function wireGalleryInteractions() {
    if (!galleriesRoot) return;

    galleriesRoot.addEventListener("click", function (e) {
      var t = e.target;
      if (!(t instanceof Element)) return;

      var addBtn = t.closest(".add-gallery-item");
      if (addBtn && galleriesRoot.contains(addBtn)) {
        var sid = addBtn.getAttribute("data-section");
        if (!sid) return;
        var list = getSectionList(sid).slice();
        list.push({
          image: "",
          href: "#",
          title: "",
          description: "",
          eyebrow: "",
          showPlay: false,
        });
        setSectionList(sid, list);
        renderGalleriesEditor();
        selectTile(sid, list.length - 1);
        return;
      }

      var del = t.closest(".admin-tile__del");
      if (del && galleriesRoot.contains(del)) {
        e.stopPropagation();
        var sec = del.getAttribute("data-section");
        var ix = parseInt(del.getAttribute("data-index"), 10);
        if (!sec || isNaN(ix)) return;
        var list = getSectionList(sec).slice();
        list.splice(ix, 1);
        setSectionList(sec, list);
        clearSelection();
        renderGalleriesEditor();
        return;
      }

      var tile = t.closest(".admin-tile");
      if (tile && galleriesRoot.contains(tile) && !t.closest(".admin-tile__del")) {
        var sectionId = tile.getAttribute("data-section");
        var index = parseInt(tile.getAttribute("data-index"), 10);
        if (sectionId && !isNaN(index)) selectTile(sectionId, index);
      }
    });

    galleriesRoot.addEventListener("dragstart", function (e) {
      var tile = e.target && e.target.closest && e.target.closest(".admin-tile");
      if (!tile || !galleriesRoot.contains(tile)) return;
      dragSource = {
        section: tile.getAttribute("data-section"),
        index: parseInt(tile.getAttribute("data-index"), 10),
      };
      e.dataTransfer.setData("text/plain", String(dragSource.index));
      e.dataTransfer.effectAllowed = "move";
      tile.classList.add("admin-tile--drag");
    });

    galleriesRoot.addEventListener("dragend", function (e) {
      var tile = e.target && e.target.closest && e.target.closest(".admin-tile");
      if (tile) tile.classList.remove("admin-tile--drag");
      dragSource = null;
    });

    galleriesRoot.addEventListener("dragover", function (e) {
      var tile = e.target && e.target.closest && e.target.closest(".admin-tile");
      if (tile && galleriesRoot.contains(tile)) e.preventDefault();
    });

    galleriesRoot.addEventListener("drop", function (e) {
      var targetTile = e.target && e.target.closest && e.target.closest(".admin-tile");
      if (!targetTile || !galleriesRoot.contains(targetTile) || !dragSource) return;
      e.preventDefault();
      var sec = targetTile.getAttribute("data-section");
      var to = parseInt(targetTile.getAttribute("data-index"), 10);
      if (sec !== dragSource.section || isNaN(to)) return;
      reorderSection(sec, dragSource.index, to);
      renderGalleriesEditor();
      selectTile(sec, to);
    });
  }

  function updateStorageOriginWarning() {
    var el = document.getElementById("admin-storage-warning");
    if (!el) return;
    if (location.protocol === "file:") {
      el.innerHTML =
        "<strong>파일로 연 admin.html</strong>(<code>file://…</code>)은 브라우저 저장소가 " +
        "<strong>http://127.0.0.1:5500</strong> 등으로 연 메인 페이지와 <strong>완전히 따로</strong>입니다. " +
        "저장해도 Live Server로 연 index에는 반영되지 않습니다. " +
        "관리자·사이트를 <strong>같은 주소</strong>(예: 둘 다 Live Server)로 열어 주세요.";
      el.classList.remove("admin-hidden");
    } else {
      el.innerHTML = "";
      el.classList.add("admin-hidden");
    }
  }

  function showAdmin() {
    loginScreen.classList.add("admin-hidden");
    adminPanel.classList.remove("admin-hidden");
    updateStorageOriginWarning();
    window.WavesGallery.whenStorageReady(function () {
      initLiveStore();
      renderSiteSettings();
      renderGalleriesEditor();
      updateStorageMeter();
      maybeShrinkLoadedStore();
    });
  }

  function maybeShrinkLoadedStore() {
    var IC = imageCompress();
    if (!IC || !liveStore) return;
    var payloadLen = 0;
    try {
      payloadLen = JSON.stringify(liveStore).length;
    } catch (e) {}
    if (
      payloadLen < 3 * 1024 * 1024 &&
      IC.estimateLocalStorageUsage() < IC.STORAGE_WARN_BYTES
    ) {
      return;
    }
    compressGalleryStore("aggressive", function () {
      compressLogoPreview(function () {
        renderGalleriesEditor();
        updateStorageMeter();
        showMessage(
          "저장 용량이 큽니다. 이미지를 미리 줄였습니다. 저장 버튼을 눌러 확정하세요.",
          "ok"
        );
      });
    });
  }

  function afterImportDone(label) {
    compressGalleryStore("normal", function () {
      compressLogoPreview(function () {
        renderGalleriesEditor();
        updateStorageMeter();
        showMessage(label, "ok");
      });
    });
  }

  if (galleriesRoot) {
    wireGalleryInteractions();
  }

  if (isLoggedIn()) {
    showAdmin();
  }

  if (adminPanel) {
    adminPanel.addEventListener("input", function (e) {
      var t = e.target;
      if (!(t instanceof HTMLInputElement)) return;
      if (t.id !== "site-logo-url") return;
      var prev = document.getElementById("site-logo-preview");
      if (!prev) return;
      var v = t.value.trim();
      prev.src = v || PLACEHOLDER_IMG;
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("admin-password");
      var val = input ? input.value : "";
      if (val === getPassword()) {
        hideLoginError();
        setLoggedIn();
        input.value = "";
        showAdmin();
      } else {
        showLoginError("비밀번호가 맞지 않습니다.");
      }
    });
  }

  function persistToLocalStorage(done) {
    try {
      window.WavesSiteSettings.save(buildSitePayloadForSave());
    } catch (err) {
      if (done) done(err);
      return;
    }
    if (window.WavesGallery.saveStoreAsync) {
      window.WavesGallery.saveStoreAsync(liveStore, done || function () {});
      return;
    }
    try {
      window.WavesGallery.saveStore(liveStore);
      if (done) done(null);
    } catch (err2) {
      if (done) done(err2);
    }
  }

  function finishSaveMessage() {
    var origin = location.origin || "";
    var hint =
      location.protocol === "file:"
        ? " 메인은 file://이 아니라 같은 PC의 http 주소로 열려 있으면, 지금 저장한 내용은 그 탭에 보이지 않습니다. Live Server로 admin·index를 모두 여세요."
        : " 메인·서브 페이지도 " +
          origin +
          " 과 동일한 주소(호스트·포트)로 열고 새로고침하세요. localhost와 127.0.0.1은 저장소가 다릅니다.";
    showMessage(
      "저장했습니다. index.html을 새로고침하거나(또는 탭을 다시 클릭) 확인하세요." +
        hint,
      "ok"
    );
    updateStorageMeter();
  }

  function runSaveWithCompress(mode) {
    mode = mode || "normal";
    if (btnSave) btnSave.disabled = true;
    showMessage(
      mode === "emergency"
        ? "용량 한도 — 이미지를 최대한 줄여 저장합니다…"
        : mode === "aggressive"
          ? "용량 한도 — 이미지를 더 줄여 저장합니다…"
          : "이미지 최적화 후 저장 중…",
      "ok"
    );
    var compressMode =
      mode === "emergency"
        ? "emergency"
        : mode === "aggressive"
          ? "aggressive"
          : "normal";
    compressGalleryStore(compressMode, function () {
      compressLogoPreview(function () {
        persistToLocalStorage(function (err) {
          if (err) {
            if (isQuotaError(err) && mode === "normal") {
              runSaveWithCompress("aggressive");
              return;
            }
            if (isQuotaError(err) && mode === "aggressive") {
              runSaveWithCompress("emergency");
              return;
            }
            var msg = "저장 중 오류가 났습니다.";
            if (isQuotaError(err)) {
              msg =
                "저장에 실패했습니다. JSON보내기로 백업한 뒤 저장 초기화를 누르거나, 이미지 수를 줄여 주세요.";
            }
            showMessage(msg, "err");
            updateStorageMeter();
            if (btnSave) btnSave.disabled = false;
            return;
          }
          finishSaveMessage();
          if (btnSave) btnSave.disabled = false;
        });
      });
    });
  }

  if (btnSave) {
    btnSave.addEventListener("click", function () {
      runSaveWithCompress("normal");
    });
  }

  if (btnRecompressHq) {
    btnRecompressHq.addEventListener("click", function () {
      if (
        !window.confirm(
          "저장된 갤러리·로고 이미지를 고화질 기준(히어로 최대 2560px, 랜딩 띠 1800px 등)으로 다시 압축합니다. 용량이 커질 수 있습니다. 계속할까요?"
        )
      ) {
        return;
      }
      btnRecompressHq.disabled = true;
      showMessage("고화질로 재압축 중… 잠시만 기다려 주세요.", "ok");
      compressGalleryStore("highquality", function () {
        compressLogoPreview(function () {
          renderGalleriesEditor();
          renderSiteSettings();
          updateStorageMeter();
          btnRecompressHq.disabled = false;
          showMessage(
            "재압축했습니다. 저장 → 배포용 파일보내기 → data/에 넣고 push 하면 Vercel에 반영됩니다. 흐린 항목은 원본 파일로 다시 올리는 것이 가장 좋습니다.",
            "ok"
          );
        }, true);
      });
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", function () {
      if (
        !window.confirm(
          "저장된 로고·갤러리 데이터를 지우고 처음 기본값으로 돌아갑니다. 계속할까요?"
        )
      ) {
        return;
      }
      window.WavesSiteSettings.resetToDefaults();
      window.WavesGallery.resetToDefaults();
      initLiveStore();
      currentPageId = "index";
      renderSiteSettings();
      renderGalleriesEditor();
      updateStorageMeter();
      showMessage("초기화했습니다.", "ok");
    });
  }

  function downloadTextFile(filename, text, mime) {
    var blob = new Blob([text], {
      type: mime || "application/json;charset=utf-8",
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (btnExportDeploy) {
    btnExportDeploy.addEventListener("click", function () {
      if (!window.WavesGallery || !window.WavesSiteSettings) {
        showMessage("갤러리·사이트 모듈을 불러오지 못했습니다.", "err");
        return;
      }
      var siteText = window.WavesSiteSettings.exportDeploySiteSettings(
        buildSitePayloadForSave()
      );
      var galleryText = window.WavesGallery.exportDeployGalleryStore(liveStore);
      downloadTextFile("site.json", siteText);
      window.setTimeout(function () {
        downloadTextFile("gallery.json", galleryText);
      }, 250);
      showMessage(
        "site.json · gallery.json을 내려받았습니다. 프로젝트 data/ 폴더에 넣은 뒤 git push 하면 Vercel에 반영됩니다.",
        "ok"
      );
    });
  }

  if (btnExport) {
    btnExport.addEventListener("click", function () {
      var payload = {
        version: 3,
        site: buildSitePayloadForSave(),
        galleryStore: liveStore,
      };
      var blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "waves-site-gallery.json";
      a.click();
      URL.revokeObjectURL(a.href);
      showMessage("JSON 파일을 내려받았습니다.", "ok");
    });
  }

  function applyImportedGalleryData(g) {
    if (g && g.pages && typeof g.pages === "object") {
      liveStore = window.WavesGallery.ensurePagesShape({
        version: 2,
        pages: g.pages,
      });
      return;
    }
    if (g && g.version === 2 && g.pages) {
      liveStore = window.WavesGallery.ensurePagesShape(g);
      return;
    }
    if (g && (g.branded || g.media)) {
      window.WavesGallery.save(g);
      liveStore = window.WavesGallery.loadRaw();
      return;
    }
    throw new Error("unknown galleries shape");
  }

  if (importFile) {
    importFile.addEventListener("change", function () {
      var file = importFile.files && importFile.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          if (parsed.version === 3 && parsed.galleryStore) {
            applyImportedGalleryData(parsed.galleryStore);
            if (parsed.site) {
              window.WavesSiteSettings.save(
                window.WavesSiteSettings.normalize(parsed.site)
              );
            }
            renderSiteSettings();
            afterImportDone(
              "가져오기 완료. 이미지를 줄였습니다. 저장 버튼으로 확정하세요."
            );
            return;
          } else if (parsed.version === 2 && parsed.galleries) {
            applyImportedGalleryData(parsed.galleries);
            if (parsed.site) {
              window.WavesSiteSettings.save(
                window.WavesSiteSettings.normalize(parsed.site)
              );
            }
            renderSiteSettings();
            afterImportDone(
              "가져오기 완료 (v2). 이미지를 줄였습니다. 저장 버튼으로 확정하세요."
            );
            return;
          } else {
            applyImportedGalleryData(parsed);
            afterImportDone(
              "갤러리만 가져왔습니다. 이미지를 줄였습니다. 저장 버튼으로 확정하세요."
            );
            return;
          }
        } catch (err) {
          showMessage("JSON 형식을 확인해 주세요.", "err");
        }
        importFile.value = "";
      };
      reader.readAsText(file, "UTF-8");
    });
  }
})();
