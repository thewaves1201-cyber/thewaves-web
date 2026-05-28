(function () {
  "use strict";

  /**
   * 문의 폼 → EmailJS → Gmail (권장)
   * Formsubmit은 수신 안정성 이슈로 제거했습니다.
   */
  window.WAVES_CONTACT_EMAIL = "contact@thewaves.kr";

  window.WAVES_EMAILJS_PUBLIC_KEY = "wY_MulFQS9eTBz1gU";
  window.WAVES_EMAILJS_SERVICE_ID = "service_yzimbob";
  window.WAVES_EMAILJS_TEMPLATE_ID = "template_qsdintg";

  window.WAVES_NAVER_MAPS_CLIENT_ID = "2f198c8dzd";

  /** 역삼로 217 — Geocoder 실패 시 지도 기본 위치 */
  window.WAVES_MAP_CENTER = {
    lat: 37.4972,
    lng: 127.0412,
    address: "서울 강남구 역삼로 217",
  };

  window.WAVES_CONTACT_SUCCESS_MSG =
    "문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.";

  window.WAVES_CONTACT_NOT_CONFIGURED_MSG =
    "문의 접수 설정이 없습니다. contact@thewaves.kr 로 직접 메일 주세요.";
})();
