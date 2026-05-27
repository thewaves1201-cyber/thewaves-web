(function () {
  "use strict";

  /**
   * [1] 이메일 수신 (기본) — PC가 달라도 동작
   * 처음 1회: contact@thewaves.kr 로 온 Formsubmit 확인 메일 링크 클릭
   */
  window.WAVES_CONTACT_EMAIL = "contact@thewaves.kr";

  /**
   * [2] n8n (선택) — n8n이 도는 PC의 IP 사용 (127.0.0.1 쓰면 안 됨)
   *
   * n8n PC에서 IP 확인 (Windows: ipconfig / Mac: ifconfig | grep inet)
   * 예: 192.168.0.23
   *
   * n8n: Publish/Active 후 Production URL
   *   http://192.168.0.23:5678/webhook/waves-contact
   *
   * 같은 Wi‑Fi/LAN, n8n PC 방화벽 5678 허용 필요
   */
  window.WAVES_CONTACT_WEBHOOK = "";

  window.WAVES_CONTACT_SUCCESS_MSG =
    "문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.";

  window.WAVES_CONTACT_NOT_CONFIGURED_MSG =
    "문의 접수 설정이 없습니다. contact@thewaves.kr 로 직접 메일 주세요.";
})();
