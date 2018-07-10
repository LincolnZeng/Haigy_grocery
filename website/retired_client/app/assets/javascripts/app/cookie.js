modulejs.define("app/cookie", [
  "alerter",
  "window",
  "haigy/lib/1.0.0/local_storage_cache",
  "app/constant",
  "app/cache"
], function(alerter, window, localStorageCache, constant, cache) {
  "use strict";


  var cookieCacherWithoutPermissionCheck = new localStorageCache({cacheHasLifetime: false});

  function setCookieTimestamp() {
    var timestamp = (new Date()).getTime().toString();
    cookieCacherWithoutPermissionCheck.setCacheByKey(constant.cookie.key.COOKIE_TIMESTAMP, timestamp);
    cache.cookieTimestamp.set(timestamp);
  }

  function getCookieTimestamp() {
    return cookieCacherWithoutPermissionCheck.getCacheByKey(constant.cookie.key.COOKIE_TIMESTAMP);
  }


  var cookieCacherWithPermissionCheck = new localStorageCache({
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


  var haigyCookie = {
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
      this.cart.clearCart();   // it also clear all cart entries and cart update time caches.
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


    initializeCookie: function(userToken, serviceAreaId, userZipCode) {
      this.clearAllCookie();
      this.tokenHandler.setToken(userToken);
      this.user.setServiceAreaId(serviceAreaId);
      this.user.setZipCode(userZipCode);
      this.cart.setCartUpdated();
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
      // an example cart: {1: true, 2: true, 3: true}
      // here, 1, 2, and 3 are item IDs
      cartCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.CART),
      setCart: function(cartObject) {
        this.cartCacher.setCache(cartObject);
      },
      getCart: function() {
        return this.cartCacher.getCache() || {};
      },
      removeUnavailableItemsInCart: function(unavailableItemsIdArray) {
        if (unavailableItemsIdArray && unavailableItemsIdArray.length > 0) {
          var cart = this.getCart();
          if (cart) {
            var unavailableItemsCount = unavailableItemsIdArray.length;
            for (var index = 0; index < unavailableItemsCount; ++index) {
              var itemId = unavailableItemsIdArray[index].toString();
              delete cart[itemId];
              cookieCacherWithPermissionCheck.clearCacheByKey(this.getCartEntryCacheKey(itemId));
            }
            this.setCart(cart);
            this.setCartUpdated();
          }
        }
      },
      clearCart: function() {
        this.clearCartId();
        this.clearCartUpdateTime();
        this.cartCacher.clearCache();
        this.specialRequestsCacher.clearCache();
        var allLocalStorageKeys = cookieCacherWithPermissionCheck.getAllKeys();
        var keyCount = allLocalStorageKeys.length;
        for (var index = 0; index < keyCount; ++index) {
          if (allLocalStorageKeys[index].substr(0, constant.cookie.key.CART_ENTRY_PREFIX.length) === constant.cookie.key.CART_ENTRY_PREFIX) {
            cookieCacherWithPermissionCheck.clearCacheByKey(allLocalStorageKeys[index]);
          }
        }
      },


      cartIdCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.CART_ID),
      setCartId: function(cartId) {
        this.cartIdCacher.setCache(cartId);
      },
      getCartId: function() {
        return this.cartIdCacher.getCache();
      },
      clearCartId: function() {
        this.cartIdCacher.clearCache();
      },


      // "updatedAt" is the number of milliseconds since 1970/01/01
      cartUpdateTimeCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.CART_UPDATE_TIME),
      setCartUpdated: function() {
        this.cartUpdateTimeCacher.setCache((new Date()).getTime());
      },
      getCartUpdateTime: function() {
        var cartUpdateTimeObject = this.cartUpdateTimeCacher.getCache();
        if (cartUpdateTimeObject) {
          return parseInt(cartUpdateTimeObject);
        } else {
          return 0;
        }
      },
      clearCartUpdateTime: function() {
        this.cartUpdateTimeCacher.clearCache();
      },


      // the structure of the cart entry is defined in "helper/cart"
      getCartEntryCacheKey: function(itemId) {
        return [constant.cookie.key.CART_ENTRY_PREFIX, itemId].join("");
      },
      setCartEntry: function(itemId, itemCartEntry, createdAt) {
        var key = this.getCartEntryCacheKey(itemId);
        var cachedCartEntry = cookieCacherWithPermissionCheck.getCacheByKey(key);
        if (!cachedCartEntry) {
          var cart = this.getCart();
          cart[itemId.toString()] = true;
          this.setCart(cart);

          // record the cart entry create time for display ordering
          itemCartEntry.createdAt = createdAt ? createdAt : (new Date()).getTime();
        }
        cookieCacherWithPermissionCheck.setCacheByKey(key, itemCartEntry);
        this.setCartUpdated();
      },
      getCartEntry: function(itemId) {
        return cookieCacherWithPermissionCheck.getCacheByKey(this.getCartEntryCacheKey(itemId));
      },
      clearCartEntry: function(itemId) {
        var cart = this.getCart();
        delete cart[itemId.toString()];
        this.setCart(cart);
        cookieCacherWithPermissionCheck.clearCacheByKey(this.getCartEntryCacheKey(itemId));
        this.setCartUpdated();
      },


      specialRequestsCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.CART_SPECIAL_REQUESTS),
      setSpecialRequests: function(specialRequestArray) {   // parameter "specialRequestArray" must be an array of all special request objects
        this.specialRequestsCacher.setCache(specialRequestArray);
        this.setCartUpdated();
      },
      getSpecialRequests: function() {   // return an array of all special request objects.
        return this.specialRequestsCacher.getCache() || [];
      }
    },


    user: {
      clearAll: function() {
        this.clearServiceAreaId();
        this.clearZipCode();
        this.clearAddress();
        this.clearSession();
      },


      serviceAreaIdCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_SERVICE_AREA_ID),
      setServiceAreaId: function(serviceAreaId) {
        this.serviceAreaIdCacher.setCache(parseInt(serviceAreaId || constant.demo.SERVICE_AREA_ID));
      },
      getServiceAreaId: function() {
        return this.serviceAreaIdCacher.getCache();
      },
      isServableArea: function() {
        var serviceAreaId = this.serviceAreaIdCacher.getCache();
        if (serviceAreaId && serviceAreaId !== constant.demo.SERVICE_AREA_ID) {
          return true;
        } else {
          return false;
        }
      },
      clearServiceAreaId: function() {
        this.serviceAreaIdCacher.clearCache();
      },


      zipCodeCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_ZIP_CODE),
      setZipCode: function(zipCode) {
        this.zipCodeCacher.setCache(zipCode.toString());
      },
      getZipCode: function() {
        return this.zipCodeCacher.getCache();
      },
      clearZipCode: function() {
        this.zipCodeCacher.clearCache();
      },


      addressCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_ADDRESS),
      setAddress: function(addressObject) {
        //
        // "addressObject" should have the format:
        // {
        //   id: XXX,
        //   streetAddress: XXX,
        //   city: XXX,
        //   state: XXX,
        //   zipCode: XXX,
        //   isBusinessAddress: XXX,
        //   businessName: XXX,
        //   label: XXX,
        //   note: XXX
        // }
        //
        this.addressCacher.setCache(addressObject);
      },
      setAddressFromUseraddressModelAttributes: function(useraddressModelAttributes) {
        var addressObject = {id: useraddressModelAttributes.id.toString()};
        addressObject.streetAddress = useraddressModelAttributes.street_address;
        addressObject.city = useraddressModelAttributes.city;
        addressObject.state = useraddressModelAttributes.state;
        addressObject.zipCode = useraddressModelAttributes.zip_code;
        addressObject.isBusinessAddress = useraddressModelAttributes.is_business_address;
        addressObject.businessName = useraddressModelAttributes.business_name;
        addressObject.label = useraddressModelAttributes.label;
        addressObject.note = useraddressModelAttributes.note;
        this.setAddress(addressObject);
      },
      getAddress: function() {
        return this.addressCacher.getCache();
      },
      clearAddress: function() {
        this.addressCacher.clearCache();
      },


      sessionCacher: cookieCacherWithPermissionCheck.generateCacher(constant.cookie.key.USER_SESSION),
      setSession: function(sessionObject) {   // the structure of "sessionObject" is defined in the file "helper/session"
        this.sessionCacher.setCache(sessionObject);
      },
      getSession: function() {
        return this.sessionCacher.getCache();
      },
      clearSession: function() {
        this.sessionCacher.clearCache();
      },


      getUserId: function() {
        var session = this.getSession();
        if (session) {
          var user = session.user;
          if (user) {
            return user.id;
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
    }
  };


  return haigyCookie;
});