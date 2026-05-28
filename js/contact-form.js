(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("contact-form-status");
  var submitBtn = form.querySelector(".contact-form__submit");

  function getEmail() {
    return (window.WAVES_CONTACT_EMAIL || "").trim();
  }

  function getEmailJsSettings() {
    return {
      publicKey: (window.WAVES_EMAILJS_PUBLIC_KEY || "").trim(),
      serviceId: (window.WAVES_EMAILJS_SERVICE_ID || "").trim(),
      templateId: (window.WAVES_EMAILJS_TEMPLATE_ID || "").trim(),
    };
  }

  function showStatus(msg, isError) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.remove("visually-hidden", "contact-form__status--error");
    if (isError) statusEl.classList.add("contact-form__status--error");
  }

  function setBusy(busy) {
    if (submitBtn) submitBtn.disabled = busy;
    form.classList.toggle("contact-form--busy", busy);
  }

  function readFields() {
    return {
      name: (form.elements.namedItem("name").value || "").trim(),
      contact: (form.elements.namedItem("contact").value || "").trim(),
      contents: (form.elements.namedItem("contents").value || "").trim(),
    };
  }

  function validate(data) {
    if (!data.name || !data.contact || !data.contents) {
      showStatus("필수 항목(NAME, CONTACT, CONTENTS)을 모두 입력해 주세요.", true);
      return false;
    }
    return true;
  }

  function sendViaEmailJs(data) {
    var cfg = getEmailJsSettings();

    if (!window.emailjs || typeof window.emailjs.send !== "function") {
      return Promise.reject(new Error("emailjs_not_loaded"));
    }
    if (!cfg.publicKey || !cfg.serviceId || !cfg.templateId) {
      return Promise.reject(new Error("emailjs_not_configured"));
    }

    var templateParams = {
      name: data.name,
      contact: data.contact,
      contents: data.contents,
      submitted_at: new Date().toLocaleString("ko-KR"),
      to_email: getEmail(),
    };

    // publicKey는 init()에서 설정하지만, 로컬 옵션으로도 한번 더 전달
    // (페이지에 init 스크립트가 누락되어도 동작하도록 안전장치)
    return window.emailjs.send(cfg.serviceId, cfg.templateId, templateParams, {
      publicKey: cfg.publicKey,
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = readFields();
    if (!validate(data)) return;

    if (!window.confirm("작성하신 내용으로 접수하시겠습니까?")) return;

    var email = getEmail();
    if (!email) {
      showStatus(
        window.WAVES_CONTACT_NOT_CONFIGURED_MSG ||
          "문의 접수 설정이 없습니다.",
        true
      );
      return;
    }

    setBusy(true);
    showStatus("접수 중입니다…", false);

    sendViaEmailJs(data)
      .then(function () {
        showStatus(
          window.WAVES_CONTACT_SUCCESS_MSG || "문의가 접수되었습니다.",
          false
        );
        form.reset();
      })
      .catch(function (err) {
        var code = err && (err.text || err.message) ? String(err.text || err.message) : "";
        var help =
          code === "emailjs_not_loaded"
            ? "EmailJS 라이브러리가 로드되지 않았습니다."
            : code === "emailjs_not_configured"
              ? "EmailJS 설정이 없습니다."
              : "잠시 후 다시 시도해 주세요.";

        showStatus(
          "접수에 실패했습니다. " + help + " 문제가 계속되면 " + email + " 로 직접 메일 주세요.",
          true
        );
      })
      .finally(function () {
        setBusy(false);
      });
  });
})();
