modulejs.define("helper/session", [
  "logger",
  "app/cookie",
  "app/constant",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "helper/cart",
  "model/session",
  "collection/cart_entry/synchronize_all"
], function(logger, cookie, constant, cachedRequest, navigator, errorHandler,
  cartHelper, sessionModel, cartentrySynchronizeallCollection
) {
  "use strict";


  var sessionHelper = {
    setSession: function(sessionAttributeObject) {
      var id = sessionAttributeObject.id;
      var user = sessionAttributeObject.user;
      var address = sessionAttributeObject.address;
      var cart = sessionAttributeObject.cart;
      var userDefaultZipCode = user.default_zip_code;
      var serviceAreaId = sessionAttributeObject.service_area_id;

      if (id && sessionAttributeObject && user && userDefaultZipCode) {
        cookie.user.setSession({id: id, user: user});

        if (address && userDefaultZipCode.toString() === (address.zip_code || "").toString()) {
          cookie.user.setAddressFromUseraddressModelAttributes(address);
        }
        cookie.user.setZipCode(userDefaultZipCode);
        cookie.user.setServiceAreaId(serviceAreaId);

        var cartEntryCollection = new cartentrySynchronizeallCollection(cart.cart_entry, {
          cartId: cart.cart_id,
          specialRequestsInJsonFormat: cart.special_requests
        });
        cartHelper.parseServerResponse(cartEntryCollection, true, false);

        return true;
      } else {
        return false;
      }
    },


    updateSession: function(sessionId, userAttributeObject) {
      var session = cookie.user.getSession();
      if (session) {
        if (sessionId) {
          session.id = sessionId;
        }
        if (userAttributeObject) {
          session.user = userAttributeObject;
        }
        cookie.user.setSession(session);
        return true;
      } else {
        return false;
      }
    },


    signOut: function() {
      var token = cookie.tokenHandler.getToken();

      if (token && token !== constant.session.GUEST_TOKEN) {
        cachedRequest.destroyModel(sessionModel, 1, {
          success: function() {
            cookie.clearAllCacheAndCookie();
            navigator.tmp();
            navigator.mainHome({replace: true});
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(["[helper/session] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      } else {
        cookie.clearAllCacheAndCookie();
        navigator.tmp();
        navigator.mainHome({replace: true});
      }
    }
  };


  return sessionHelper;
});
