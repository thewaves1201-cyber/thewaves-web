(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("contact-form-status");
  var submitBtn = form.querySelector(".contact-form__submit");

  function getEmail() {
    return (window.WAVES_CONTACT_EMAIL || "").trim();
  }

  function getWebhookUrl() {
    var url = (window.WAVES_CONTACT_WEBHOOK || "").trim();
    if (!url) return "";
    var host = window.location.hostname;
    if (host === "127.0.0.1") {
      url = url.replace(/\/\/localhost\b/i, "//127.0.0.1");
    } else if (host === "localhost") {
      url = url.replace(/\/\/127\.0\.0\.1\b/, "//localhost");
    }
    return url;
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

  /** Formsubmit — 정적 사이트에서 CORS 허용, 메일로 수신 */
  function sendViaEmail(toEmail, data) {
    var body = {
      name: data.name,
      _subject: "[The Waves] 문의 — " + data.name,
      _template: "table",
      _captcha: "false",
      contact: data.contact,
      message:
        "연락처: " +
        data.contact +
        "\n\n내용:\n" +
        data.contents +
        "\n\n(접수 시각: " +
        new Date().toLocaleString("ko-KR") +
        ")",
    };
    if (data.contact.indexOf("@") !== -1) {
      body.email = data.contact;
    }

    return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(toEmail), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }).then(function (res) {
      return res.json().then(function (json) {
        if (!res.ok || (json && json.success === false)) {
          var err = new Error((json && json.message) || "formsubmit");
          throw err;
        }
        return json;
      });
    });
  }

  function sendViaN8n(url, data) {
    var payload = {
      name: data.name,
      contact: data.contact,
      contents: data.contents,
      submittedAt: new Date().toISOString(),
      page: "contact.html",
    };
    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      if (navigator.sendBeacon(url, blob)) {
        return Promise.resolve();
      }
    }
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = readFields();
    if (!validate(data)) return;

    if (!window.confirm("작성하신 내용으로 접수하시겠습니까?")) return;

    var email = getEmail();
    var webhook = getWebhookUrl();

    if (!email && !webhook) {
      showStatus(
        window.WAVES_CONTACT_NOT_CONFIGURED_MSG ||
          "문의 접수 설정이 없습니다.",
        true
      );
      return;
    }

    setBusy(true);
    showStatus("접수 중입니다…", false);

    var main =
      email
        ? sendViaEmail(email, data)
        : sendViaN8n(webhook, data);

    main
      .then(function () {
        if (webhook && email) {
          sendViaN8n(webhook, data).catch(function () {});
        }
        showStatus(
          window.WAVES_CONTACT_SUCCESS_MSG ||
            "문의가 접수되었습니다.",
          false
        );
        form.reset();
      })
      .catch(function () {
        showStatus(
          "접수에 실패했습니다. " +
            (email
              ? "잠시 후 다시 시도하거나 " + email + " 로 직접 메일 주세요."
              : "contact@thewaves.kr 로 직접 메일 주세요."),
          true
        );
      })
      .finally(function () {
        setBusy(false);
      });
  });
})();
