modulejs.define("haigy/lib/1.1.0/key_value_cache", function() {
  "use strict";


  var KeyValueCache = function(options) {
    this.cacheLifetimeInMinute = 360;
    this.expirationTimeRefreshable = true;   // setting this to "true" means that the expiration time will get refreshed when the cache gets refreshed later.
    this.storage = {};

    if (options) {
      if (options.cacheLifetimeInMinute !== undefined && options.cacheLifetimeInMinute !== null) {
        this.cacheLifetimeInMinute = parseFloat(options.cacheLifetimeInMinute);
      }

      if (options.expirationTimeRefreshable === false) {
        this.expirationTimeRefreshable = false;
      }
    }
  };


  KeyValueCache.prototype.setCacheLifetimeInMinute = function(customizedCacheLifetimeInMinute) {
    this.cacheLifetimeInMinute = parseFloat(customizedCacheLifetimeInMinute);
  };


  KeyValueCache.prototype.setExpirationTimeRefreshable = function(trueOrFalse) {
    this.expirationTimeRefreshable = (trueOrFalse !== false);
  };


  KeyValueCache.prototype.setCache = function(key, value, customizedCacheLifetimeInMinute) {
    var valueWrapper = {};
    valueWrapper.content = value;

    var cacheLifetimeInMinute = this.cacheLifetimeInMinute;
    if (customizedCacheLifetimeInMinute !== undefined && customizedCacheLifetimeInMinute !== null) {
      cacheLifetimeInMinute = parseFloat(customizedCacheLifetimeInMinute);
    }

    var currentTimeInMinute = (new Date()).getTime() / 60000.0;
    if (this.expirationTimeRefreshable) {
      valueWrapper.expireTime = currentTimeInMinute + cacheLifetimeInMinute;
    } else {
      var oldCachedValueWrapper = this.storage[key];
      if (oldCachedValueWrapper && oldCachedValueWrapper.expireTime > currentTimeInMinute) {
        valueWrapper.expireTime = oldCachedValueWrapper.expireTime;
      } else {
        valueWrapper.expireTime = currentTimeInMinute + cacheLifetimeInMinute;
      }
    }
    this.storage[key] = valueWrapper;

    // console.log("--- set cache ---");
    // console.log(this.storage);
    // console.log("---");
  };


  KeyValueCache.prototype.getCache = function(key, ignoreCacheLifeTime) {
    var valueWrapper = this.storage[key];
    if (valueWrapper) {
      if (ignoreCacheLifeTime === true) {
        return valueWrapper.content;
      } else {
        var currentTimeInMinute = (new Date()).getTime() / 60000.0;
        if (valueWrapper.expireTime > currentTimeInMinute) {
          return valueWrapper.content;
        } else {
          this.clearCache();
          return null;
        }
      }
    } else {
      return null;
    }
  };


  KeyValueCache.prototype.clearCache = function(key) {
    delete this.storage[key];

    // console.log("--- clear cache ---");
    // console.log(this.storage);
    // console.log("---");
  };


  KeyValueCache.prototype.reset = function() {
    this.storage = {};

    // console.log("--- reset ---");
    // console.log(this.storage);
    // console.log("---");
  };


  return KeyValueCache;
});