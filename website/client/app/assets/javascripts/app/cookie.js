modulejs.define("app/cookie", [
  "alerter",
  "window",
  "lib/local_storage_cache",
  "app/constant",
  "app/cache",
  "app/utility"
], function(alerter, window, LocalStorageCache, constant, cache, utility) {
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


  var haigyClientCookie = {
    initialize: function() {
      var cookieTimestamp = this.getCookieTimestamp();
      if (cookieTimestamp) {
        cache.cookieTimestamp.set(cookieTimestamp);
      } else {
        this.setCookieTimestamp();
      }

      var cookieVersion = this.getCookieVersion();
      if (cookieVersion && cookieVersion === constant.cookie.VERSION) {
        var token = this.tokenHandler.getToken();
        if (token) {
          utility.setTokenInAjaxRequest(token);
        }
      } else {
        this.clearAllCacheAndCookie();
        this.setCookieVersion();
      }

      // for privacy, we should not save address in the cookie for a guest user or a temporary user
      this.user.clearTemporaryUserAddressInfo();
    },


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


    clearAllCookieExceptToken: function() {
      this.cart.clearCart();   // it also clear all cart entries.
      this.user.clearAll();
    },


    clearAllCookie: function() {
      this.clearAllCookieExceptToken();
      this.tokenHandler.clearToken();
    },


    clearAllCacheAndCookie: function() {
      cache.clearAll();
      this.clearAllCookie();
    },


    tokenHandler: {
      tokenCacher: cookieCacherWithoutPermissionCheck.generateCacher(constant.cookie.key.TOKEN),

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

      // use both cookie and cache to store cart id
      // storing cart id in cache could make the cart show page refreshable.
      // storing cart id in cookie could make all other cart related functionalities more stable
      cartIdCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.CART_ID),
      setCartId: function(cartId) {
        var cartIdString = cartId.toString();
        this.cartIdCacher.setCache(cartIdString);
        cache.cartId.set(cartIdString);
      },
      getCartIdFromCookie: function() {
        var cartId = this.cartIdCacher.getCache();
        return cartId;
      },
      getCartIdFromCache: function() {
        var cartId = cache.cartId.get();
        return cartId;
      },
      clearCartId: function() {
        this.cartIdCacher.clearCache();
        cache.cartId.clear();
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


    user: {
      clearAll: function() {
        this.clearUserId();
        this.clearIsTemporary();
        this.clearDeliveryZipCode();
        this.clearShoppingZipCode();
        this.clearNickname();
        this.clearEmail();
        this.clearPhone();
        this.clearAddress();
      },


      clearTemporaryUserAddressInfo: function() {
        // for protecting users' privacy, we should not save address in the cookie for a guest user or a temporary user
        if (this.isGuest() === true || this.getIsTemporary() === true) {
          this.clearAddress();
          this.clearDeliveryZipCode();
        }
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


      // guest is a customer that never used Haigy before
      // after a guest checked out once on Haigy, a temporary user is created to store his/her order history
      // if a guest or a temporary user registered on Haigy, then he/she becomes a formal Haigy user
      isGuest: function(userToken) {
        var token = userToken || haigyClientCookie.tokenHandler.getToken();
        return token === constant.session.GUEST_TOKEN;
      },


      // this is the cook entry to see if a customer is a temporary user or not
      isTemporaryCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_IS_TEMPORARY),
      setIsTemporary: function(isTemporary) {
        this.isTemporaryCacher.setCache((isTemporary === true));
      },
      getIsTemporary: function() {
        return this.isTemporaryCacher.getCache();
      },
      clearIsTemporary: function() {
        this.isTemporaryCacher.clearCache();
      },


      deliveryZipCodeCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_DELIVERY_ZIP_CODE),
      setDeliveryZipCode: function(deliveryZipCode) {
        if (deliveryZipCode) {
          this.deliveryZipCodeCacher.setCache(deliveryZipCode.toString());
        }
      },
      getDeliveryZipCode: function() {
        return this.deliveryZipCodeCacher.getCache();
      },
      clearDeliveryZipCode: function() {
        this.deliveryZipCodeCacher.clearCache();
      },


      // the shopping zip code is the zip code for items browsered on the website
      // if user's zip code is deliverable, the shopping zip code should be the same as his/her delivery zip code.
      // otherwise, the shopping zip code is the Haigy default zip code for the website demonstration
      shoppingZipCodeCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_SHOPPING_ZIP_CODE),
      setShoppingZipCode: function(shoppingZipCode) {
        if (shoppingZipCode) {
          this.shoppingZipCodeCacher.setCache(shoppingZipCode.toString());
        }
      },
      getShoppingZipCode: function() {
        return this.shoppingZipCodeCacher.getCache() || constant.business.DEFAULT_SHOPPING_ZIP_CODE.toString();
      },
      clearShoppingZipCode: function() {
        this.shoppingZipCodeCacher.clearCache();
      },


      hasDeliverableZipCode: function() {
        var deliveryZipCode = this.getDeliveryZipCode();
        if (deliveryZipCode) {
          if (deliveryZipCode === this.getShoppingZipCode()) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
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
      },


      emailCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_EMAIL),
      setEmail: function(email) {
        if (email) {
          this.emailCacher.setCache(email.toString());
        }
      },
      getEmail: function() {
        return this.emailCacher.getCache();
      },
      clearEmail: function() {
        this.emailCacher.clearCache();
      },


      phoneCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_PHONE),
      setPhone: function(phone) {
        if (phone) {
          this.phoneCacher.setCache(phone.toString());
        }
      },
      getPhone: function() {
        return this.phoneCacher.getCache();
      },
      clearPhone: function() {
        this.phoneCacher.clearCache();
      },


      // the structure of the "normalizedAddressAttributeObject" is defined in "utility.getNormalizedAddressAttributeObject"
      addressCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_ADDRESS),
      setAddress: function(normalizedAddressAttributeObject) {
        if (normalizedAddressAttributeObject) {
          this.addressCacher.setCache(normalizedAddressAttributeObject);
        }
      },
      getAddress: function() {
        return this.addressCacher.getCache();
      },
      clearAddress: function() {
        this.addressCacher.clearCache();
      }
    }
  };


  haigyClientCookie.initialize();


  return haigyClientCookie;
});