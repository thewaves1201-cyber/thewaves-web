(function (global) {
  "use strict";

  var DB_NAME = "waves_gallery_db";
  var DB_VERSION = 1;
  var STORE = "kv";
  var KEY_GALLERY = "gallery_v2";

  function openDb(cb) {
    if (!global.indexedDB) {
      cb(new Error("indexedDB unavailable"));
      return;
    }
    var req = global.indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = function () {
      cb(req.error || new Error("idb open failed"));
    };
    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = function () {
      cb(null, req.result);
    };
  }

  function withStore(mode, fn, cb) {
    openDb(function (err, db) {
      if (err) {
        cb(err);
        return;
      }
      try {
        var tx = db.transaction(STORE, mode);
        var store = tx.objectStore(STORE);
        fn(store, tx, db);
      } catch (e) {
        cb(e);
      }
    });
  }

  function loadGallery(cb) {
    withStore(
      "readonly",
      function (store, tx) {
        var req = store.get(KEY_GALLERY);
        req.onsuccess = function () {
          cb(null, typeof req.result === "string" ? req.result : null);
        };
        req.onerror = function () {
          cb(req.error || new Error("idb read failed"));
        };
      },
      function () {}
    );
  }

  function saveGallery(jsonString, cb) {
    cb = cb || function () {};
    withStore(
      "readwrite",
      function (store, tx) {
        store.put(jsonString, KEY_GALLERY);
        tx.oncomplete = function () {
          cb(null);
        };
        tx.onerror = function () {
          cb(tx.error || new Error("idb write failed"));
        };
        tx.onabort = function () {
          cb(tx.error || new Error("idb write aborted"));
        };
      },
      function () {}
    );
  }

  function removeGallery(cb) {
    cb = cb || function () {};
    withStore(
      "readwrite",
      function (store, tx) {
        store.delete(KEY_GALLERY);
        tx.oncomplete = function () {
          cb(null);
        };
        tx.onerror = function () {
          cb(tx.error || new Error("idb delete failed"));
        };
      },
      function () {}
    );
  }

  function estimateGalleryBytes(cb) {
    loadGallery(function (err, json) {
      if (err) {
        cb(err, 0);
        return;
      }
      cb(null, json ? estimateUtf16Bytes(json) : 0);
    });
  }

  function estimateUtf16Bytes(str) {
    return (str ? str.length : 0) * 2;
  }

  function estimateQuota(cb) {
    if (global.navigator && navigator.storage && navigator.storage.estimate) {
      navigator.storage
        .estimate()
        .then(function (est) {
          cb(null, {
            usage: est.usage || 0,
            quota: est.quota || 0,
          });
        })
        .catch(function (e) {
          cb(e, { usage: 0, quota: 0 });
        });
      return;
    }
    cb(null, { usage: 0, quota: 0 });
  }

  global.WavesGalleryDB = {
    DB_NAME: DB_NAME,
    KEY_GALLERY: KEY_GALLERY,
    loadGallery: loadGallery,
    saveGallery: saveGallery,
    removeGallery: removeGallery,
    estimateGalleryBytes: estimateGalleryBytes,
    estimateQuota: estimateQuota,
  };
})(typeof window !== "undefined" ? window : this);
