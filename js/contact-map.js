(function () {
  "use strict";

  var el = document.getElementById("naver-map");
  if (!el) return;

  var DEFAULT_CENTER = window.WAVES_MAP_CENTER || {
    lat: 37.4972,
    lng: 127.0412,
    address: "서울 강남구 역삼로 217",
  };

  function getClientId() {
    return (window.WAVES_NAVER_MAPS_CLIENT_ID || "").trim();
  }

  function showFallback(reason) {
    var msg = "지도를 불러오지 못했습니다.";
    if (reason === "missing_client_id") {
      msg = "네이버 지도 Client ID가 없습니다.";
    } else if (reason === "script_load_failed") {
      msg = "네이버 지도 스크립트 로드에 실패했습니다.";
    }

    el.innerHTML =
      '<p class="contact-map__fallback"><strong>' +
      msg +
      "</strong><br/>네이버 클라우드 콘솔 → Maps → Application → Web 서비스 URL에 " +
      "<code>https://thewaves.kr</code>, <code>https://www.thewaves.kr</code> 등록 후 저장해 주세요.</p>";
  }

  function initMap(center) {
    var map = new window.naver.maps.Map(el, {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom: 17,
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

    var address = DEFAULT_CENTER.address || "서울 강남구 역삼로 217";
    var content =
      '<div class="waves-map-infowindow" style="padding:8px 10px; font-size:12px; line-height:1.35; white-space:nowrap; color:#1a1a1a;">' +
      '<div style="font-weight:700; letter-spacing:0.02em; color:#111;">THE WAVES</div>' +
      '<div style="margin-top:2px; color:#333;">' +
      address +
      "</div></div>";

    var infowindow = new window.naver.maps.InfoWindow({
      content: content,
      borderWidth: 0,
      backgroundColor: "#ffffff",
      disableAnchor: true,
      pixelOffset: new window.naver.maps.Point(0, -10),
    });

    infowindow.open(map, marker);
  }

  function resolveCenter() {
    return new Promise(function (resolve) {
      var fallback = {
        lat: DEFAULT_CENTER.lat,
        lng: DEFAULT_CENTER.lng,
      };

      if (
        !window.naver ||
        !window.naver.maps ||
        !window.naver.maps.Service ||
        typeof window.naver.maps.Service.geocode !== "function"
      ) {
        resolve(fallback);
        return;
      }

      window.naver.maps.Service.geocode(
        { query: DEFAULT_CENTER.address || "서울 강남구 역삼로 217" },
        function (status, response) {
          if (status === window.naver.maps.Service.Status.ERROR) {
            resolve(fallback);
            return;
          }
          var addresses =
            response && response.v2 && Array.isArray(response.v2.addresses)
              ? response.v2.addresses
              : [];
          if (!addresses.length) {
            resolve(fallback);
            return;
          }
          var item = addresses[0];
          resolve({
            lat: parseFloat(item.y),
            lng: parseFloat(item.x),
          });
        }
      );
    });
  }

  function loadMapsApi() {
    return new Promise(function (resolve, reject) {
      if (window.naver && window.naver.maps && typeof window.naver.maps.Map === "function") {
        resolve();
        return;
      }

      var cid = getClientId();
      if (!cid) {
        reject(new Error("missing_client_id"));
        return;
      }

      var paramNames = ["ncpKeyId", "ncpClientId"];
      var paramIndex = 0;
      var settled = false;

      function finishOk() {
        if (settled) return;
        settled = true;
        resolve();
      }

      function finishErr() {
        if (settled) return;
        settled = true;
        reject(new Error("script_load_failed"));
      }

      function tryNextParam() {
        if (paramIndex >= paramNames.length) {
          finishErr();
          return;
        }

        var paramName = paramNames[paramIndex++];
        var cbName = "__wavesNaverMapReady_" + Date.now();

        window[cbName] = function () {
          try {
            delete window[cbName];
          } catch (e) {
            window[cbName] = undefined;
          }
          finishOk();
        };

        var s = document.createElement("script");
        s.async = true;
        s.defer = true;
        s.dataset.waves = "naver-maps-js";
        s.src =
          "https://oapi.map.naver.com/openapi/v3/maps.js?" +
          paramName +
          "=" +
          encodeURIComponent(cid) +
          "&submodules=geocoder&callback=" +
          cbName;

        s.onerror = function () {
          try {
            delete window[cbName];
          } catch (e) {
            window[cbName] = undefined;
          }
          if (s.parentNode) s.parentNode.removeChild(s);
          tryNextParam();
        };

        document.head.appendChild(s);
      }

      tryNextParam();
    });
  }

  loadMapsApi()
    .then(resolveCenter)
    .then(initMap)
    .catch(function (err) {
      showFallback(err && err.message ? err.message : "unknown");
    });
})();
