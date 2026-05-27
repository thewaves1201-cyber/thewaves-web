(function (global) {
  "use strict";

  var DEFAULT_OPTS = {
    maxDimension: 1400,
    quality: 0.82,
    preservePng: false,
    backgroundColor: "#ffffff",
  };

  /** 사이트 본문 배경 (--bg) — 흰 로고 PNG/JPEG 처리용 */
  var SITE_BG_FILL = "#1c1c1c";

  function formatBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function scaleDimensions(w, h, maxDim) {
    if (!w || !h) return { w: 1, h: 1 };
    if (w <= maxDim && h <= maxDim) return { w: w, h: h };
    var ratio = Math.min(maxDim / w, maxDim / h);
    return {
      w: Math.max(1, Math.round(w * ratio)),
      h: Math.max(1, Math.round(h * ratio)),
    };
  }

  function loadImage(src, cb) {
    var img = new Image();
    img.onload = function () {
      cb(null, img);
    };
    img.onerror = function () {
      cb(new Error("image load failed"));
    };
    img.src = src;
  }

  function encodeCanvas(canvas, mime, quality) {
    try {
      return canvas.toDataURL(mime, quality);
    } catch (e) {
      return canvas.toDataURL("image/jpeg", quality);
    }
  }

  function drawAndEncode(img, opts, cb) {
    var o = Object.assign({}, DEFAULT_OPTS, opts || {});
    var w = img.naturalWidth || img.width || 1;
    var h = img.naturalHeight || img.height || 1;
    var dim = scaleDimensions(w, h, o.maxDimension);
    var canvas = document.createElement("canvas");
    canvas.width = dim.w;
    canvas.height = dim.h;
    var ctx = canvas.getContext("2d");
    if (!ctx) {
      cb(new Error("canvas unsupported"));
      return;
    }
    if (!o.preservePng) {
      ctx.fillStyle = o.backgroundColor || "#ffffff";
      ctx.fillRect(0, 0, dim.w, dim.h);
    }
    ctx.drawImage(img, 0, 0, dim.w, dim.h);
    var mime = o.preservePng ? "image/png" : "image/jpeg";
    var out = encodeCanvas(canvas, mime, o.quality);
    cb(null, out);
  }

  function isDataImage(url) {
    return typeof url === "string" && /^data:image\//i.test(url);
  }

  function isSvg(url) {
    return /svg\+xml/i.test(url || "");
  }

  function compressFile(file, opts, cb) {
    if (!file || !/^image\//i.test(file.type)) {
      cb(new Error("not an image"));
      return;
    }
    if (/svg/i.test(file.type)) {
      var reader = new FileReader();
      reader.onload = function () {
        cb(null, reader.result || "");
      };
      reader.onerror = function () {
        cb(new Error("read failed"));
      };
      reader.readAsDataURL(file);
      return;
    }
    var blobUrl = URL.createObjectURL(file);
    loadImage(blobUrl, function (err, img) {
      URL.revokeObjectURL(blobUrl);
      if (err) {
        cb(err);
        return;
      }
      var usePng =
        !!opts && opts.preservePng && /png/i.test(file.type);
      drawAndEncode(
        img,
        Object.assign({}, opts, { preservePng: usePng }),
        function (err2, dataUrl) {
          if (err2) {
            cb(err2);
            return;
          }
          cb(null, dataUrl);
        }
      );
    });
  }

  function compressDataUrl(dataUrl, opts, cb) {
    if (!isDataImage(dataUrl)) {
      cb(null, dataUrl);
      return;
    }
    if (isSvg(dataUrl)) {
      cb(null, dataUrl);
      return;
    }
    loadImage(dataUrl, function (err, img) {
      if (err) {
        cb(null, dataUrl);
        return;
      }
      var before = dataUrl.length;
      var o = Object.assign({}, DEFAULT_OPTS, opts || {});
      if (/image\/png/i.test(dataUrl) && o.preservePng) {
        o.preservePng = true;
      } else if (!o.preservePng) {
        o.preservePng = false;
      }
      drawAndEncode(img, o, function (err2, out) {
        if (err2 || !out) {
          cb(null, dataUrl);
          return;
        }
        if (out.length >= before && before < 180000) {
          cb(null, dataUrl);
          return;
        }
        cb(null, out);
      });
    });
  }

  function estimateUtf16Bytes(str) {
    return (str ? str.length : 0) * 2;
  }

  function estimateLocalStorageUsage() {
    var used = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        var v = localStorage.getItem(k);
        used += estimateUtf16Bytes(k) + estimateUtf16Bytes(v);
      }
    } catch (e) {}
    return used;
  }

  /** localStorage만 쓸 때 기준 (갤러리는 IndexedDB 사용) */
  var STORAGE_WARN_BYTES = 4.5 * 1024 * 1024;
  var STORAGE_LIMIT_BYTES = 5 * 1024 * 1024;
  /** IndexedDB 포함 안내용 표시 한도 */
  var STORAGE_DISPLAY_QUOTA_BYTES = 50 * 1024 * 1024;

  function estimateSiteStorageUsage(cb) {
    var ls = estimateLocalStorageUsage();
    if (!global.WavesGalleryDB) {
      cb(null, { used: ls, quota: STORAGE_LIMIT_BYTES, gallery: 0, local: ls });
      return;
    }
    global.WavesGalleryDB.estimateGalleryBytes(function (err, galleryBytes) {
      var gallery = err ? 0 : galleryBytes;
      if (global.navigator && navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(function (est) {
          cb(null, {
            used: est.usage || ls + gallery,
            quota: est.quota || STORAGE_DISPLAY_QUOTA_BYTES,
            gallery: gallery,
            local: ls,
          });
        });
        return;
      }
      cb(null, {
        used: ls + gallery,
        quota: STORAGE_DISPLAY_QUOTA_BYTES,
        gallery: gallery,
        local: ls,
      });
    });
  }

  global.WavesImageCompress = {
    DEFAULT_OPTS: DEFAULT_OPTS,
    SITE_BG_FILL: SITE_BG_FILL,
    STORAGE_WARN_BYTES: STORAGE_WARN_BYTES,
    STORAGE_LIMIT_BYTES: STORAGE_LIMIT_BYTES,
    STORAGE_DISPLAY_QUOTA_BYTES: STORAGE_DISPLAY_QUOTA_BYTES,
    formatBytes: formatBytes,
    compressFile: compressFile,
    compressDataUrl: compressDataUrl,
    estimateLocalStorageUsage: estimateLocalStorageUsage,
    estimateSiteStorageUsage: estimateSiteStorageUsage,
    isDataImage: isDataImage,
  };
})(typeof window !== "undefined" ? window : this);
