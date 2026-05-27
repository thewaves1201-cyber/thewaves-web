(function () {
  "use strict";

  var SESSION_KEY = "waves_admin_ok";

  var INDEX_FIELDS = [
    {
      key: "sectionGap",
      label: "섹션 사이 여백",
      hint: "메인 각 섹션(브랜디드·미디어 등) 위·아래 간격",
      min: 32,
      max: 180,
      step: 2,
      unit: "px",
    },
    {
      key: "titleToLineGap",
      label: "제목 ↔ 주황/흰 선",
      hint: "섹션 제목 글자와 가로 구분선 사이",
      min: 8,
      max: 72,
      step: 1,
      unit: "px",
    },
    {
      key: "lineToThumbGap",
      label: "선 ↔ 썸네일",
      hint: "가로 구분선과 썸네일 첫 줄 사이",
      min: 8,
      max: 72,
      step: 1,
      unit: "px",
    },
    {
      key: "titleSize",
      label: "섹션 제목 글자 크기",
      hint: "주황/흰 섹션 제목",
      min: 12,
      max: 32,
      step: 1,
      unit: "px",
    },
    {
      key: "cardTitleSize",
      label: "썸네일 아래 제목",
      hint: "카드 굵은 제목",
      min: 9,
      max: 20,
      step: 1,
      unit: "px",
    },
    {
      key: "cardDescSize",
      label: "썸네일 아래 설명",
      hint: "카드 설명 줄",
      min: 8,
      max: 16,
      step: 1,
      unit: "px",
    },
  ];

  var HUB_FIELDS = [
    {
      key: "hubTopGap",
      label: "헤더 ↔ 대제목",
      hint: "상단 메뉴와 페이지 큰 제목 사이",
      min: 16,
      max: 120,
      step: 2,
      unit: "px",
    },
    {
      key: "hubHeroTitleSize",
      label: "페이지 대제목 글자 크기",
      hint: "MUSIC BUSINESS, BRANDED PROJECTS 등 주황 대제목",
      min: 20,
      max: 80,
      step: 2,
      unit: "px",
    },
    {
      key: "hubHeroToSubnavGap",
      label: "대제목 ↔ 서브탭",
      hint: "MUSIC BUSINESS 글자와 ARTIST MANAGEMENT 탭 사이",
      min: 0,
      max: 72,
      step: 2,
      unit: "px",
    },
    {
      key: "hubSubnavSize",
      label: "서브탭 글자 크기",
      hint: "ARTIST MANAGEMENT, BRAND MARKETING 등 탭 링크",
      min: 10,
      max: 28,
      step: 1,
      unit: "px",
    },
    {
      key: "hubSubnavGap",
      label: "서브탭 사이 간격",
      hint: "탭 링크끼리 가로 간격",
      min: 8,
      max: 72,
      step: 2,
      unit: "px",
    },
    {
      key: "hubIntroGap",
      label: "서브탭 ↔ 섹션 제목",
      hint: "히어로(대제목·탭) 아래 ~ 첫 주황 섹션 제목 사이",
      min: 16,
      max: 120,
      step: 2,
      unit: "px",
    },
    {
      key: "hubSectionGap",
      label: "섹션 사이 여백",
      hint: "썸네일 아래 ~ 다음 섹션(더보기·다음 블록) 사이",
      min: 16,
      max: 120,
      step: 2,
      unit: "px",
    },
    {
      key: "hubTitleToLineGap",
      label: "섹션 제목 ↔ 흰 선",
      hint: "BRAND MARKETING 글자와 가로선 사이",
      min: 8,
      max: 72,
      step: 1,
      unit: "px",
    },
    {
      key: "hubLineToThumbGap",
      label: "흰 선 ↔ 썸네일",
      hint: "가로선과 썸네일 첫 줄 사이",
      min: 8,
      max: 72,
      step: 1,
      unit: "px",
    },
    {
      key: "titleSize",
      label: "섹션 제목 글자 크기",
      hint: "주황 섹션 제목",
      min: 12,
      max: 32,
      step: 1,
      unit: "px",
    },
    {
      key: "cardTitleSize",
      label: "썸네일 아래 제목",
      hint: "카드 굵은 제목",
      min: 9,
      max: 20,
      step: 1,
      unit: "px",
    },
    {
      key: "cardDescSize",
      label: "썸네일 아래 설명",
      hint: "카드 설명 줄",
      min: 8,
      max: 16,
      step: 1,
      unit: "px",
    },
  ];

  var CONTACT_FIELDS = [
    {
      key: "contactHeroBrandSize",
      label: "THE WAVES (주황) 글자 크기",
      hint: "CONTACT 페이지 상단 주황 대제목",
      min: 24,
      max: 80,
      step: 2,
      unit: "px",
    },
    {
      key: "contactHeroTitleSize",
      label: "CONTACT US (흰색) 글자 크기",
      hint: "CONTACT 페이지 상단 흰색 대제목",
      min: 24,
      max: 80,
      step: 2,
      unit: "px",
    },
    {
      key: "contactInfoSize",
      label: "연락처 정보 글자 크기",
      hint: "주소·이메일·전화번호",
      min: 11,
      max: 22,
      step: 1,
      unit: "px",
    },
    {
      key: "contactLabelSize",
      label: "폼 라벨 글자 크기",
      hint: "NAME, CONTACT, CONTENTS",
      min: 10,
      max: 20,
      step: 1,
      unit: "px",
    },
  ];

  var PARTNERS_FIELDS = [
    {
      key: "partnerLogoHeight",
      label: "파트너 로고 높이",
      hint: "로고 이미지 세로 크기 (가로는 비율 유지)",
      min: 40,
      max: 200,
      step: 2,
      unit: "px",
    },
    {
      key: "partnerLogoMaxWidth",
      label: "파트너 로고 최대 너비",
      hint: "한 칸 안에서 로고가 넓어질 수 있는 최대값",
      min: 100,
      max: 480,
      step: 4,
      unit: "px",
    },
    {
      key: "partnerCaptionSize",
      label: "로고 아래 글자 크기",
      hint: "SK telecom, 스마일게이트 등 회사명 캡션",
      min: 9,
      max: 32,
      step: 1,
      unit: "px",
    },
  ];

  function getFieldsForPage(pageId) {
    if (pageId === "index") return INDEX_FIELDS;
    if (pageId === "contact") return HUB_FIELDS.concat(CONTACT_FIELDS);
    if (pageId === "partners") {
      return HUB_FIELDS.filter(function (f) {
        return f.key !== "cardTitleSize" && f.key !== "cardDescSize";
      }).concat(PARTNERS_FIELDS);
    }
    return HUB_FIELDS;
  }

  var loginScreen = document.getElementById("login-screen");
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var designPanel = document.getElementById("design-panel");
  var controlsRoot = document.getElementById("design-controls");
  var msgEl = document.getElementById("design-message");
  var iframe = document.getElementById("design-preview-frame");
  var pageSelect = document.getElementById("design-page-select");
  var btnSave = document.getElementById("btn-design-save");
  var btnReset = document.getElementById("btn-design-reset");

  var currentPageId = "index";

  function getPassword() {
    return window.WAVES_ADMIN_PASSWORD || "thewaves-admin";
  }

  function isLoggedIn() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setLoggedIn() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch (e) {}
  }

  function showLoginError(text) {
    if (!loginError) return;
    loginError.textContent = text;
    loginError.classList.remove("admin-hidden");
  }

  function hideLoginError() {
    if (loginError) loginError.classList.add("admin-hidden");
  }

  function showMessage(text, kind) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = "admin-msg admin-msg--" + (kind || "ok");
    msgEl.classList.remove("admin-hidden");
    clearTimeout(showMessage._t);
    showMessage._t = setTimeout(function () {
      msgEl.classList.add("admin-hidden");
    }, 5000);
  }

  function getPageMeta(pageId) {
    var list = window.WavesSiteSettings.DESIGN_PAGE_LIST || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === pageId) return list[i];
    }
    return list[0] || { id: "index", path: "index.html", label: "메인" };
  }

  function readFormDesign() {
    var d = {};
    getFieldsForPage(currentPageId).forEach(function (f) {
      var inp = document.getElementById("design-" + f.key);
      if (inp) d[f.key] = parseInt(inp.value, 10);
    });
    return window.WavesSiteSettings.normalizeDesign(d, currentPageId);
  }

  function pushPreview(design) {
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        {
          type: "waves-design-preview",
          design: design,
          pageId: currentPageId,
        },
        "*"
      );
    } catch (e) {}
  }

  function onControlsChange() {
    pushPreview(readFormDesign());
  }

  function renderControls(design) {
    if (!controlsRoot) return;
    var meta = getPageMeta(currentPageId);
    var html =
      '<section class="admin-section">' +
      "<h3>" +
      meta.label +
      "</h3>" +
      '<p class="admin-hint admin-design-hint">슬라이더를 움직이면 오른쪽 미리보기에 즉시 반영됩니다. 페이지마다 따로 저장됩니다.</p>';

    var fields = getFieldsForPage(currentPageId);
    fields.forEach(function (f) {
      var val = design[f.key];
      html +=
        '<div class="admin-design-field" data-key="' +
        f.key +
        '">' +
        '<div class="admin-design-field__head">' +
        "<label for=\"design-" +
        f.key +
        '">' +
        f.label +
        "</label>" +
        '<output id="design-out-' +
        f.key +
        '" for="design-' +
        f.key +
        '">' +
        val +
        f.unit +
        "</output>" +
        "</div>" +
        '<p class="admin-design-field__hint">' +
        f.hint +
        "</p>" +
        '<input type="range" id="design-' +
        f.key +
        '" min="' +
        f.min +
        '" max="' +
        f.max +
        '" step="' +
        f.step +
        '" value="' +
        val +
        '" />' +
        "</div>";
    });

    html += "</section>";
    controlsRoot.innerHTML = html;

    fields.forEach(function (f) {
      var inp = document.getElementById("design-" + f.key);
      var out = document.getElementById("design-out-" + f.key);
      if (!inp) return;
      inp.addEventListener("input", function () {
        if (out) out.textContent = inp.value + f.unit;
        onControlsChange();
      });
    });
  }

  function loadPageDesign(pageId) {
    currentPageId = pageId;
    var s = window.WavesSiteSettings.load();
    var design = window.WavesSiteSettings.getDesignForPage(pageId, s);
    renderControls(design);
    pushPreview(design);

    if (!iframe) return;
    var meta = getPageMeta(pageId);
    var src = meta.path + (meta.hash || "");
    if (iframe.getAttribute("src") !== src) {
      iframe.src = src;
    } else {
      try {
        iframe.contentWindow.location.reload();
      } catch (e) {
        iframe.src = src;
      }
    }

    var barLabel = document.querySelector(".admin-design-preview-bar > span");
    if (barLabel) barLabel.textContent = "미리보기 — " + meta.label;
  }

  function saveDesign() {
    var prev = window.WavesSiteSettings.load();
    var design = readFormDesign();
    var designPages = Object.assign({}, prev.designPages || {});
    designPages[currentPageId] = design;
    var next = window.WavesSiteSettings.normalize({
      logoUrl: prev.logoUrl,
      aboutHeroUrl: prev.aboutHeroUrl,
      youtubeUrl: prev.youtubeUrl,
      instagramUrl: prev.instagramUrl,
      naverUrl: prev.naverUrl,
      design: currentPageId === "index" ? design : prev.design,
      designPages: designPages,
    });
    if (currentPageId === "index") {
      next.design = design;
    }
    window.WavesSiteSettings.save(next);
    showMessage(
      getPageMeta(currentPageId).label + " 디자인을 저장했습니다. 해당 페이지를 새로고침하세요.",
      "ok"
    );
  }

  function resetDesignFields() {
    var d = Object.assign(
      {},
      window.WavesSiteSettings.DESIGN_PAGE_DEFAULTS[currentPageId] ||
        window.WavesSiteSettings.DESIGN_DEFAULT
    );
    renderControls(
      window.WavesSiteSettings.normalizeDesign(d, currentPageId)
    );
    pushPreview(
      window.WavesSiteSettings.normalizeDesign(d, currentPageId)
    );
    showMessage("슬라이더를 이 페이지 기본값으로 맞췄습니다. 저장을 눌러 확정하세요.", "ok");
  }

  function populatePageSelect() {
    if (!pageSelect || !window.WavesSiteSettings) return;
    var list = window.WavesSiteSettings.DESIGN_PAGE_LIST || [];
    var current = pageSelect.value || currentPageId;
    pageSelect.innerHTML = list
      .map(function (p) {
        return (
          '<option value="' +
          p.id +
          '"' +
          (p.id === current ? " selected" : "") +
          ">" +
          p.label +
          "</option>"
        );
      })
      .join("");
  }

  function showPanel() {
    loginScreen.classList.add("admin-hidden");
    designPanel.classList.remove("admin-hidden");
    populatePageSelect();
    loadPageDesign(pageSelect ? pageSelect.value : "index");
  }

  if (pageSelect) {
    pageSelect.addEventListener("change", function () {
      loadPageDesign(pageSelect.value);
    });
  }

  if (iframe) {
    iframe.addEventListener("load", function () {
      pushPreview(readFormDesign());
    });
  }

  if (btnSave) {
    btnSave.addEventListener("click", saveDesign);
  }

  if (btnReset) {
    btnReset.addEventListener("click", function () {
      if (
        !window.confirm(
          "이 페이지의 슬라이더를 기본값으로 맞출까요? (저장 전까지 사이트에는 반영되지 않습니다)"
        )
      ) {
        return;
      }
      resetDesignFields();
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
        if (input) input.value = "";
        showPanel();
      } else {
        showLoginError("비밀번호가 맞지 않습니다.");
      }
    });
  }

  if (isLoggedIn()) {
    showPanel();
  }
})();
