modulejs.define("app/cookie", [
  "alerter",
  "window",
  "lib/local_storage_cache",
  "app/constant",
  "app/cache"
], function(alerter, window, LocalStorageCache, constant, cache) {
  "use strict";


  var cookieCacherWithoutPermissionCheck = new LocalStorageCache({cacheHasLifetime: false});

  function setCookieTimestamp() {
    var timestamp = (new Date()).getTime().toString();
    cookieCacherWithoutPermissionCheck.setCacheByKey(constant.cookie.key.COOKIE_TIMESTAMP, timestamp);
    cache.cookieTimestamp.set(timestamp);
  }

  function getCookieTimestamp() {
    return cookieCacherWithoutPermissionCheck.getCacheByKey(constant.cookie.key.COOKIE_TIMESTAMP);
  }


  // if the view content had a chance to be unsynchronized with the cookie in multiple browser, this permission check is necessary to make all of them keep synced.
  var cookieCacherWithPermissionCheck = new LocalStorageCache({
    cacheHasLifetime: false,
    hasWritePermission: function() {
      return (getCookieTimestamp() === cache.cookieTimestamp.get());
    },
    actionForNoWritePermission: function() {
      alerter("You might have made some changes in other place. The page is going to be refreshed.");
      window.location.reload();
      throw "Refresh the page.";
    },
    actionAfterCacheChange: setCookieTimestamp
  });


  var haigyFulFillCookie = {
    setCookieVersion: function() {
      // please change the cookie version whenever anything related to the cookie got changed.
      // change the cookie version will expire all users' cookie and cache. it will avoid many unpredictable errors
      cookieCacherWithoutPermissionCheck.setCacheByKey(constant.cookie.key.COOKIE_VERSION, constant.cookie.VERSION);
    },


    getCookieVersion: function() {
      return cookieCacherWithoutPermissionCheck.getCacheByKey(constant.cookie.key.COOKIE_VERSION);
    },


    setCookieTimestamp: function() {
      setCookieTimestamp();
    },


    getCookieTimestamp: function() {
      return getCookieTimestamp();
    },


    clearAllUserRelatedCookie: function() {
      this.cart.clearCart();   // it also clear all cart entries.
      this.user.clearAll();
    },


    clearAllCacheAndCookie: function() {
      cache.clearAll();
      this.clearAllUserRelatedCookie();
      this.employee.clearAll();
      this.tokenHandler.clearToken();
    },


    tokenHandler: {
      tokenCacher: (new LocalStorageCache({cacheLifetimeInMinute: constant.session.LIFETIME_IN_MINUTE, expirationTimeRefreshable: false})).generateCacher(constant.cookie.key.TOKEN),

      setToken: function(token) {
        this.tokenCacher.setCache(token);
      },

      getToken: function() {
        return this.tokenCacher.getCache();
      },

      clearToken: function() {
        this.tokenCacher.clearCache();
      }
    },


    cart: {
      clearCart: function() {
        this.clearCartId();
        this.cartItemIdListCacher.clearCache();
        var allLocalStorageKeys = cookieCacherWithPermissionCheck.getAllKeys();
        var keyCount = allLocalStorageKeys.length;
        for (var index = 0; index < keyCount; ++index) {
          if (allLocalStorageKeys[index].substr(0, constant.cookie.key.CART_ENTRY_PREFIX.length) === constant.cookie.key.CART_ENTRY_PREFIX) {
            cookieCacherWithPermissionCheck.clearCacheByKey(allLocalStorageKeys[index]);
          }
        }
      },

      // an example cartItemIdListObject: {1: 1462376988404, 2: 1462376988406, 3: 1462376988498}
      // here, 1, 2, and 3 are item IDs
      // numbers like "1462376988404" is the "createdAt" time (the number of milliseconds since 1970/01/01)
      cartItemIdListCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.CART_ITEM_ID_LIST),
      setCartItemIdList: function(cartItemIdListObject) {
        this.cartItemIdListCacher.setCache(cartItemIdListObject);
      },
      getCartItemIdList: function() {
        return this.cartItemIdListCacher.getCache() || {};
      },


      cartIdCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.CART_ID),
      setCartId: function(cartId) {
        this.cartIdCacher.setCache(cartId);
        cache.cartId.set(cartId);
      },
      getCartIdFromCookie: function() {
        return this.cartIdCacher.getCache();
      },
      getCartIdFromCache: function() {
        return cache.cartId.get();
      },
      clearCartIdFromCache: function() {
        cache.cartId.clear();
      },
      clearCartId: function() {
        this.cartIdCacher.clearCache();
        cache.cartId.clear();
      },


      // the structure of the cart entry is defined in "helper/cart"
      getCartEntryCacheKey: function(itemId) {
        return [constant.cookie.key.CART_ENTRY_PREFIX, itemId].join("");
      },
      setCartEntry: function(itemId, itemCartEntry, createdAt) {
        var key = this.getCartEntryCacheKey(itemId);
        var cachedCartEntry = cookieCacherWithPermissionCheck.getCacheByKey(key);
        if (!cachedCartEntry) {
          var cartItemIdList = this.getCartItemIdList();
          // record the cart entry create time for display ordering
          cartItemIdList[itemId.toString()] = createdAt ? createdAt : (new Date()).getTime();
          this.setCartItemIdList(cartItemIdList);
        }
        cookieCacherWithPermissionCheck.setCacheByKey(key, itemCartEntry);
      },
      getCartEntry: function(itemId) {
        return cookieCacherWithPermissionCheck.getCacheByKey(this.getCartEntryCacheKey(itemId));
      },
      clearCartEntry: function(itemId) {
        var cartItemIdList = this.getCartItemIdList();
        delete cartItemIdList[itemId.toString()];
        this.setCartItemIdList(cartItemIdList);
        cookieCacherWithPermissionCheck.clearCacheByKey(this.getCartEntryCacheKey(itemId));
      }
    },


    employee: {
      clearAll: function() {
        this.clearEmployeeId();
      },


      employeeIdCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.EMPLOYEE_ID),
      setEmployeeId: function(employeeId) {
        if (employeeId) {
          this.employeeIdCacher.setCache(employeeId.toString());
        }
      },
      getEmployeeId: function() {
        return this.employeeIdCacher.getCache();
      },
      clearEmployeeId: function() {
        this.employeeIdCacher.clearCache();
      }
    },


    user: {
      clearAll: function() {
        this.clearUserId();
        this.clearZipCode();
        this.clearNickname();
      },


      userIdCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_ID),
      setUserId: function(userId) {
        if (userId) {
          this.userIdCacher.setCache(userId.toString());
        }
      },
      getUserId: function() {
        return this.userIdCacher.getCache();
      },
      clearUserId: function() {
        this.userIdCacher.clearCache();
      },


      zipCodeCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_ZIP_CODE),
      setZipCode: function(zipCode) {
        if (zipCode) {
          this.zipCodeCacher.setCache(zipCode.toString());
        }
      },
      getZipCode: function() {
        return this.zipCodeCacher.getCache();
      },
      clearZipCode: function() {
        this.zipCodeCacher.clearCache();
      },


      nicknameCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_NICKNAME),
      setNickname: function(nickname) {
        if (nickname) {
          this.nicknameCacher.setCache(nickname.toString());
        }
      },
      getNickname: function() {
        return this.nicknameCacher.getCache();
      },
      clearNickname: function() {
        this.nicknameCacher.clearCache();
      }
    }
  };


  return haigyFulFillCookie;
});