modulejs.define("helper/session", [
  "logger",
  "page_loading_blocker",
  "app/cookie",
  "app/constant",
  "app/utility",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "state/store",
  "state/action",
  "helper/cart",
  "model/session",
  "collection/cart_entry/synchronize_all"
], function(logger, pageLoadingBlocker, cookie, constant, utility, cachedRequest, navigator, errorHandler,
  stateStore, stateAction, cartHelper, sessionModel, cartentrySynchronizeallCollection
) {
  "use strict";


  var sessionHelper = {
    dispatchUserAttributeState: function() {
      stateStore.dispatch(stateAction.setUserAttributes({
        userId: cookie.user.getUserId(),
        isTemporary: cookie.user.getIsTemporary(),
        nickname: cookie.user.getNickname(),
        email: cookie.user.getEmail(),
        phone: cookie.user.getPhone(),
        deliveryZipCode: cookie.user.getDeliveryZipCode(),
        shoppingZipCode: cookie.user.getShoppingZipCode(),
        address: cookie.user.getAddress()
      }));
    },


    synchronizeSession: function() {
      stateStore.dispatch(stateAction.setSessionIsUpToDate(false));
      if (cookie.user.getUserId()) {
        var that = this;

        cachedRequest.saveModel(sessionModel, {user_id: cookie.user.getUserId()}, {
          success: function(createdSession) {
            that.setSession(
              createdSession.get("user"),
              createdSession.get("cart_id"),
              createdSession.get("cart_entry")
            );
            stateStore.dispatch(stateAction.setSessionIsUpToDate(true));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            cookie.clearAllCacheAndCookie();
            stateStore.dispatch(stateAction.setSessionIsUpToDate(true));
          }
        });
      } else {
        stateStore.dispatch(stateAction.setSessionIsUpToDate(true));
      }
    },


    setSession: function(userProfile, cartId, cartEntryArray) {
      cookie.clearAllCookieExceptToken();
      cookie.user.setUserId(userProfile.id);
      cookie.user.setIsTemporary(userProfile.is_temporary);
      cookie.user.setNickname(userProfile.nickname);
      cookie.user.setShoppingZipCode(userProfile.shopping_zip_code);
      cookie.user.setEmail(userProfile.email);
      cookie.user.setPhone(userProfile.phone);
      if (userProfile.default_address) {
        var normalizedAddress = utility.getNormalizedAddressAttributeObject(userProfile.default_address);
        cookie.user.setDeliveryZipCode(normalizedAddress.zipCode);
        cookie.user.setAddress(normalizedAddress);
      } else {
        cookie.user.setDeliveryZipCode(userProfile.default_zip_code);
      }

      var cartEntryCollection = new cartentrySynchronizeallCollection(
        cartEntryArray,
        {cartId: cartId}
      );
      cartHelper.parseServerResponse(cartEntryCollection, true);   // cartId is stored by this function

      this.dispatchUserAttributeState();
    },


    updateAddress: function(addressFromServerResponse, shoppingZipCode) {
      if (addressFromServerResponse) {
        var normalizedAddress = utility.getNormalizedAddressAttributeObject(addressFromServerResponse);
        cookie.user.setDeliveryZipCode(normalizedAddress.zipCode);
        cookie.user.setAddress(normalizedAddress);
      } else {
        cookie.user.clearDeliveryZipCode();
        cookie.user.clearAddress();
      }
      if (shoppingZipCode) {
        cookie.user.setShoppingZipCode(shoppingZipCode);
      }
      this.dispatchUserAttributeState();
    },


    clearEverything: function() {
      navigator.tmp();
      navigator.mainHome({replace: true});
      cookie.clearAllCacheAndCookie();
      this.dispatchUserAttributeState();
    },


    signOut: function() {
      var token = cookie.tokenHandler.getToken();

      if (token && token !== constant.session.GUEST_TOKEN) {
        var that = this;

        var signingOutText = cookie.user.getIsTemporary() ? "Leaving": "Signing out";
        pageLoadingBlocker(signingOutText, "See you next time!").open();

        cachedRequest.destroyModel(sessionModel, 1, {
          success: function() {
            that.clearEverything();
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
          }
        });
      } else {
        this.clearEverything();
      }
    }
  };


  return sessionHelper;
});
