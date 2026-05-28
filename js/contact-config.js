(function () {
  "use strict";

  /**
   * [1] 이메일 수신 (기본) — PC가 달라도 동작
   * 처음 1회: contact@thewaves.kr 로 온 Formsubmit 확인 메일 링크 클릭
   */
  window.WAVES_CONTACT_EMAIL = "contact@thewaves.kr";

  /**
   * [2] n8n (권장) — 내부(사내/Wi‑Fi) + 외부(Vercel) 모두 받기
   *
   * - 내부 접수(같은 Wi‑Fi/LAN): n8n PC의 내부 IP 사용
   *   예: http://192.168.0.23:5678/webhook/waves-contact
   *
   * - 외부 접수(Vercel/인터넷): n8n을 외부에서 접근 가능한 https로 공개해야 함
   *   (예: Cloudflare Tunnel/ngrok/서버 배포)
   *   예: https://n8n.your-domain.com/webhook/waves-contact
   *
   * 내부 IP 사용 시: 같은 Wi‑Fi/LAN, n8n PC 방화벽 5678 허용 필요
   */
  window.WAVES_CONTACT_WEBHOOK_LOCAL =
    "http://172.30.1.1:5678/webhook/waves-contact";
  window.WAVES_CONTACT_WEBHOOK_PUBLIC =
    "https://carton-shopper-virus.ngrok-free.dev/webhook/waves-contact";

  /**
   * (하위 호환) 기존 단일 설정값.
   * 비워두면 contact-form.js가 LOCAL/PUBLIC를 자동 선택합니다.
   */
  window.WAVES_CONTACT_WEBHOOK = "";

  window.WAVES_CONTACT_SUCCESS_MSG =
    "문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.";

  window.WAVES_CONTACT_NOT_CONFIGURED_MSG =
    "문의 접수 설정이 없습니다. contact@thewaves.kr 로 직접 메일 주세요.";
})();
