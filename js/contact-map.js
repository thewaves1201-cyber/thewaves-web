(function () {
  "use strict";

  var el = document.getElementById("naver-map");
  if (!el) return;

  function getClientId() {
    return (window.WAVES_NAVER_MAPS_CLIENT_ID || "").trim();
  }

  function ensureApiLoaded() {
    return new Promise(function (resolve, reject) {
      if (window.naver && window.naver.maps) return resolve();
      var cid = getClientId();
      if (!cid) return reject(new Error("missing_client_id"));

      function loadOnce(paramName) {
        return new Promise(function (resolveLoad, rejectLoad) {
          var existing = document.querySelector(
            'script[data-waves="naver-maps-js"][data-param="' + paramName + '"]'
          );
          if (existing) {
            existing.addEventListener("load", function () {
              resolveLoad();
            });
            existing.addEventListener("error", function () {
              rejectLoad(new Error("script_load_failed"));
            });
            return;
          }

          var s = document.createElement("script");
          s.async = true;
          s.defer = true;
          s.dataset.waves = "naver-maps-js";
          s.dataset.param = paramName;
          s.src =
            "https://oapi.map.naver.com/openapi/v3/maps.js?" +
            paramName +
            "=" +
            encodeURIComponent(cid) +
            "&submodules=geocoder";
          s.onload = function () {
            resolveLoad();
          };
          s.onerror = function () {
            rejectLoad(new Error("script_load_failed"));
          };
          document.head.appendChild(s);
        });
      }

      var existing = document.querySelector(
        'script[data-waves="naver-maps-js"]'
      );
      if (existing) {
        existing.addEventListener("load", function () {
          resolve();
        });
        existing.addEventListener("error", function () {
          reject(new Error("script_load_failed"));
        });
        return;
      }

      // ncpKeyId / ncpClientId 혼용 이슈가 있어 둘 다 순차 시도합니다.
      // 1) ncpKeyId (신규 통합 콘솔 권장)
      // 2) ncpClientId (레거시 문서/키)
      loadOnce("ncpKeyId")
        .catch(function () {
          return loadOnce("ncpClientId");
        })
        .then(function () {
          resolve();
        })
        .catch(function (e) {
          reject(e);
        });
    });
  }

  function geocode(address) {
    return new Promise(function (resolve, reject) {
      if (
        !window.naver ||
        !window.naver.maps ||
        !window.naver.maps.Service ||
        typeof window.naver.maps.Service.geocode !== "function"
      ) {
        return reject(new Error("geocoder_unavailable"));
      }

      window.naver.maps.Service.geocode(
        { query: address },
        function (status, response) {
          if (status === window.naver.maps.Service.Status.ERROR) {
            return reject(new Error("geocode_error"));
          }
          var addresses =
            response && response.v2 && Array.isArray(response.v2.addresses)
              ? response.v2.addresses
              : [];
          if (!addresses.length) return reject(new Error("geocode_empty"));
          var item = addresses[0];
          resolve({
            lat: parseFloat(item.y),
            lng: parseFloat(item.x),
            roadAddress: item.roadAddress || "",
            jibunAddress: item.jibunAddress || "",
          });
        }
      );
    });
  }

  function initMap(center) {
    var map = new window.naver.maps.Map(el, {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom: 16,
      minZoom: 10,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    });

    var marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(center.lat, center.lng),
      map: map,
    });

    var content =
      '<div style="padding:8px 10px; font-size:12px; line-height:1.35; white-space:nowrap;">' +
      '<div style="font-weight:700; letter-spacing:0.02em;">THE WAVES</div>' +
      '<div style="opacity:0.85; margin-top:2px;">서울 강남구 역삼로 217</div>' +
      "</div>";

    var infowindow = new window.naver.maps.InfoWindow({
      content: content,
      borderWidth: 0,
      backgroundColor: "#ffffff",
      disableAnchor: true,
      pixelOffset: new window.naver.maps.Point(0, -10),
    });

    infowindow.open(map, marker);
  }

  function showFallback(reason) {
    var msg = "지도를 불러오지 못했습니다.";
    if (reason === "missing_client_id") msg = "네이버 지도 Client ID가 없습니다.";
    if (reason === "script_load_failed") msg = "네이버 지도 스크립트 로드에 실패했습니다.";
    if (reason === "geocoder_unavailable") msg = "네이버 지도 Geocoder 모듈이 준비되지 않았습니다.";
    if (reason === "geocode_empty") msg = "주소 검색 결과가 없습니다.";
    if (reason === "geocode_error") msg = "주소를 좌표로 변환하는 중 오류가 발생했습니다.";

    // 지도 컨테이너를 클릭 불가한 안내 박스로 대체
    el.innerHTML =
      '<p class="contact-map__fallback"><strong>' +
      msg +
      "</strong><br/>네이버 클라우드 콘솔에서 Maps 웹 서비스 URL(도메인) 등록 여부를 확인해 주세요.</p>";
  }

  ensureApiLoaded()
    .then(function () {
      return geocode("서울 강남구 역삼로 217");
    })
    .then(function (center) {
      initMap(center);
    })
    .catch(function (err) {
      showFallback(err && err.message ? err.message : "unknown");
    });
})();

