modulejs.define("haigy/lib/1.1.0/local_storage_cache", function() {
  "use strict";


  var LocalStorageCache = function(options) {
    this.cacheHasLifetime = true;
    this.cacheLifetimeInMinute = 360;
    this.expirationTimeRefreshable = false;   // setting this to "true" means that the expiration time will get refreshed when the cache gets refreshed later.
    this.hasWritePermission = function() {return true;};
    this.actionForNoWritePermission = function() {};
    this.actionAfterCacheChange = function() {};

    if (options) {
      if (options.cacheHasLifetime === false) {
        this.cacheHasLifetime = false;
      }

      if (options.cacheLifetimeInMinute !== undefined && options.cacheLifetimeInMinute !== null) {
        this.cacheLifetimeInMinute = parseFloat(options.cacheLifetimeInMinute);
      }

      if (options.expirationTimeRefreshable === false) {
        this.expirationTimeRefreshable = false;
      }

      if (options.hasWritePermission) {
        this.hasWritePermission = options.hasWritePermission;
      }

      if (options.actionForNoWritePermission) {
        this.actionForNoWritePermission = options.actionForNoWritePermission;
      }

      if (options.actionAfterCacheChange) {
        this.actionAfterCacheChange = options.actionAfterCacheChange;
      }
    }
  };


  LocalStorageCache.prototype.getAllKeys = function() {
    var allKeys = [];
    var keyCount = localStorage.length;
    for (var index = 0; index < keyCount; ++index) {
      allKeys.push(localStorage.key(index));
    }
    return allKeys;
  };


  LocalStorageCache.prototype.setCacheByKey = function(key, value) {
    if (this.hasWritePermission()) {
      var valueWrapper = {};
      valueWrapper.content = value;
      if (this.cacheHasLifetime) {
        var currentTimeInMinute = (new Date()).getTime() / 60000.0;
        if (this.expirationTimeRefreshable) {
          valueWrapper.expireTime = currentTimeInMinute + this.cacheLifetimeInMinute;
        } else {
          var oldCachedValueWrapper = JSON.parse(localStorage.getItem(key));
          if (oldCachedValueWrapper && oldCachedValueWrapper.expireTime > currentTimeInMinute) {
            valueWrapper.expireTime = oldCachedValueWrapper.expireTime;
          } else {
            valueWrapper.expireTime = currentTimeInMinute + this.cacheLifetimeInMinute;
          }
        }
      }
      localStorage.setItem(key, JSON.stringify(valueWrapper));
      this.actionAfterCacheChange();
    } else {
      this.actionForNoWritePermission();
    }
  };


  LocalStorageCache.prototype.getCacheByKey = function(key) {
    var valueWrapper = null;
    try {
      valueWrapper = JSON.parse(localStorage.getItem(key));
    } catch(error) {
      valueWrapper = null;
    }

    if (valueWrapper) {
      if (this.cacheHasLifetime) {
        var currentTimeInMinute = (new Date()).getTime() / 60000.0;
        if (valueWrapper.expireTime > currentTimeInMinute) {
          return valueWrapper.content;
        } else {
          this.clearCacheByKey(key);
          return null;
        }
      } else {
        return valueWrapper.content;
      }
    } else {
      return null;
    }
  };


  LocalStorageCache.prototype.clearCacheByKey = function(key) {
    if (this.hasWritePermission()) {
      localStorage.removeItem(key);
      this.actionAfterCacheChange();
    } else {
      this.actionForNoWritePermission();
    }
  };


  LocalStorageCache.prototype.generateCacher = function(key) {
    var that = this;

    return {
      setCache: function(value) {
        that.setCacheByKey(key, value);
      },

      getCache: function() {
        return that.getCacheByKey(key);
      },

      clearCache: function() {
        that.clearCacheByKey(key);
      }
    };
  };


  return LocalStorageCache;
});