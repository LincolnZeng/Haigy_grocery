modulejs.define("app/cache", [
  "lib/key_value_cache",
  "lib/backbone_cache",
  "app/constant"
], function(KeyValueCache, backboneCache, constant) {
  "use strict";


  var haigyCache = new KeyValueCache();
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
    haigyCache.userNewAddressInputData.clear();
    haigyCache.orderCheckoutData.clear();
  };


  haigyCache.clearCachedRequestCache = function() {
    backboneCache.clearAll();
  };


  haigyCache.cartId = cacherGenerator("HaigyClientCache-CartId");


  haigyCache.lastScrollPositionData = cacherGenerator("HaigyClientCache-LastScrollPositionData");


  haigyCache.cookieTimestamp = cacherGenerator("HaigyClientCache-CookieTimestamp", null, function() {
    return haigyCache.getCache(this.key, true);
  });


  haigyCache.userNewAddressInputData = cacherGenerator("HaigyClientCache-UserNewAddressInputData");


  haigyCache.orderCheckoutData = cacherGenerator("HaigyClientCache-OrderCheckoutData", function(data) {
    haigyCache.setCache(this.key, data, constant.order.CACHED_CHECKOUT_DATA_LIFETIME_IN_MINUTE);
  });


  return haigyCache;
});