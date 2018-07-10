modulejs.define("app/cache", [
  "lib/key_value_cache",
  "lib/backbone_cache"
], function(KeyValueCache, backboneCache) {
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
  };


  haigyCache.clearCachedRequestCache = function() {
    backboneCache.clearAll();
  };


  haigyCache.cartId = cacherGenerator("HaigyFulfillCache-CartId");


  haigyCache.lastScrollPositionData = cacherGenerator("HaigyFulfillCache-LastScrollPositionData");


  haigyCache.cookieTimestamp = cacherGenerator("HaigyFulfillCache-CookieTimestamp", null, function() {
    return haigyCache.getCache(this.key, true);
  });


  return haigyCache;
});