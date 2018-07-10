modulejs.define("app/cache", [
  "haigy/lib/1.0.0/key_value_cache",
  "haigy/lib/1.0.0/backbone_cache"
], function(keyValueCache, backboneCache) {
  "use strict";


  var haigyCache = new keyValueCache();
  var cacherGenerator = function(cacheKey, setFunction, getFunction, clearFunction) {
    return {
      key: cacheKey,
      set: setFunction || function(data) {
        haigyCache.setCache(this.key, data);
      },
      get: getFunction || function() {
        return haigyCache.getCache(this.key);
      },
      clear: clearFunction || function() {
        return haigyCache.clearCache(this.key);
      }
    };
  };


  haigyCache.clearAll = function() {
    haigyCache.clearCachedRequestCache();
    haigyCache.lastScrollPositionData.clear();
    haigyCache.userModaleditaddressData.clear();
    haigyCache.orderGuestcheckoutData.clear();
    haigyCache.orderUsercheckoutData.clear();
    haigyCache.guestOrderViewPermission.clear();
  };


  haigyCache.clearCachedRequestCache = function() {
    backboneCache.clearAll();
  };


  haigyCache.lastScrollPositionData = cacherGenerator("HaigyCache-LastScrollPositionData");


  haigyCache.cookieTimestamp = cacherGenerator("HaigyCache-CookieTimestamp", null, function() {
    return haigyCache.getCache(this.key, true);
  });


  haigyCache.userModaleditaddressData = cacherGenerator("HaigyCache-UserModaleditaddressData");


  haigyCache.orderGuestcheckoutData = cacherGenerator("HaigyCache-OrderGuestcheckoutData", function(guestCheckoutData, orderIsReady) {
    if (orderIsReady === true) {
      guestCheckoutData.ready = true;
    } else {
      guestCheckoutData.ready = false;
    }
    haigyCache.setCache(this.key, guestCheckoutData);
  });


  haigyCache.orderUsercheckoutData = cacherGenerator("HaigyCache-OrderUsercheckoutData", function(userCheckoutData, orderIsReady) {
    if (orderIsReady === true) {
      userCheckoutData.ready = true;
    } else {
      userCheckoutData.ready = false;
    }
    haigyCache.setCache(this.key, userCheckoutData);
  });


  haigyCache.guestOrderViewPermission = cacherGenerator("HaigyCache-GuestOrderViewPermission");
  haigyCache.guestOrderViewPermission.grantPermission = function(guestOrderId, orderEmail) {
    var permissionCache = this.get() || {};
    permissionCache[guestOrderId] = orderEmail;
    this.set(permissionCache);
  };
  haigyCache.guestOrderViewPermission.getOrderEmailIfHasPermission = function(guestOrderId) {
    var permissionCache = this.get();
    if (permissionCache) {
      return permissionCache[guestOrderId];
    } else {
      return null;
    }
  };

  return haigyCache;
});