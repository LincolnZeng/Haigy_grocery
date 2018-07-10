modulejs.define("app/cookie", [
  "lib/local_storage_cache",
  "app/constant"
], function(LocalStorageCache, constant) {
  "use strict";


  var haigyManageCookieCacher = new LocalStorageCache({cacheHasLifetime: false});


  var haigyManageCookie = {
    clearAll: function() {
      this.clearSelectedStoreId();
      this.clearSession();
    },


    selectStoreIdCacher: haigyManageCookieCacher.generateCacher(constant.cookie.cacheKey.SELECT_STORE_ID),
    setSelectedStoreId: function(selectedStoreId) {
      this.selectStoreIdCacher.setCache({selectedStoreId: selectedStoreId});
    },
    getSelectedStoreId: function() {
      var cache = this.selectStoreIdCacher.getCache();
      if (cache) {
        return cache.selectedStoreId;
      } else {
        return null;
      }
    },
    clearSelectedStoreId: function() {
      this.selectStoreIdCacher.clearCache();
    },


    sessionCacher: haigyManageCookieCacher.generateCacher(constant.cookie.cacheKey.SESSION),
    setSession: function(sessionObject) {
      this.sessionCacher.setCache(sessionObject);
    },
    getSession: function() {
      return this.sessionCacher.getCache();
    },
    clearSession: function() {
      this.sessionCacher.clearCache();
    }
  };


  return haigyManageCookie;
});