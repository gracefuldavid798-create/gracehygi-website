/**
 * Image Override — 自动加载 admin 后台上传的图片
 * 
 * 原理：admin 和前端在同一个域名下，共享 IndexedDB。
 * admin 上传图片 → 存入 gracehygi_images
 * 前端页面加载时 → 从 IndexedDB 读取覆盖匹配的 <img>
 * 
 * 对其他访客（浏览器没有 IndexedDB 数据）：无感，显示原始图片。
 */
(function() {
  'use strict';

  var DB_NAME = 'gracehygi_images';
  var STORE_NAME = 'images';

  // 尝试打开 admin 存储的 IndexedDB
  var req = indexedDB.open(DB_NAME, 1);

  req.onsuccess = function(e) {
    var db = e.target.result;

    // 数据库存在但可能没有 store（首次初始化时）
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.close();
      return;
    }

    var tx = db.transaction(STORE_NAME, 'readonly');
    var store = tx.objectStore(STORE_NAME);
    var getAllReq = store.getAll();

    getAllReq.onsuccess = function() {
      var images = getAllReq.result;
      db.close();

      if (!images || images.length === 0) return;

      // 构建 slotId → dataUrl 映射表
      var imageMap = {};
      for (var i = 0; i < images.length; i++) {
        imageMap[images[i].id] = images[i].dataUrl;
      }

      var slotIds = Object.keys(imageMap);
      if (slotIds.length === 0) return;

      // 遍历页面上所有图片
      var allImgs = document.querySelectorAll('img[src]');
      var replaced = 0;

      for (var j = 0; j < allImgs.length; j++) {
        var img = allImgs[j];
        var src = img.getAttribute('src') || '';

        // 跳过已经是 data URL 的（已被替换过或原本就是）
        if (src.indexOf('data:') === 0) continue;

        // 跳过空 src
        if (!src) continue;

        // 匹配：检查 src 中是否包含任意一个 slotId
        for (var k = 0; k < slotIds.length; k++) {
          var slotId = slotIds[k];
          if (src.indexOf(slotId) !== -1) {
            img.src = imageMap[slotId];
            img.removeAttribute('srcset');
            replaced++;
            break;
          }
        }
      }

      if (replaced > 0) {
        console.log('[ImageOverride] 已从 IndexedDB 覆盖 ' + replaced + ' 张图片');
      }
    };

    getAllReq.onerror = function() {
      db.close();
    };
  };

  req.onerror = function() {
    // IndexedDB 不可用或权限被拒 — 静默忽略
  };
})();
