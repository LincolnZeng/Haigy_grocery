modulejs.define("helper/select_user_address", [
  "alerter",
  "logger",
  "underscore",
  "jquery",
  "app/constant",
  "app/utility",
  "app/cookie",
  "app/cached_request",
  "app/error_handler",
  "helper/cart",
  "view/main/modal_busy",
  "view/user/modal_all_address",
  "view/user/modal_edit_address",
  "collection/user_address/index",
  "collection/user_address/change_zip_code",
  "collection/user_address/select_address"
], function(
  alerter, logger, _, $, constant, utility, cookie, cachedRequest, errorHandler, cartHelper,
  mainModalbusyViewDef, userModalalladdressViewDef, userModaleditaddressViewDef,
  useraddressIndexCollection, useraddressChangezipcodeCollection, useraddressSelectAddressCollection
) {
  "use strict";


  var SelectuseraddressHelper = function(options) {
    this.userId = options.userId;
    this.view = options.view;
    this.addressChangeCallback = options.addressChangeCallback;
    this.enableZipCodeChange = (options.enableZipCodeChange === true);
    this.zipCodeChangeCallback = options.zipCodeChangeCallback;

    this.allAddressModal = null;
    this.newAddressModal = null;
    this.editAddressModal = null;

    this.scrollTopPosition = 0;
    _.bindAll(this, "showAllAddress", "selectAddress", "newAddress", "editAddress");
  };


  SelectuseraddressHelper.prototype.start = function(easyFirstAddressMode) {
    this.removeAllModals();
    this.scrollTopPosition = utility.scrollTopPosition();
    this.showAllAddress(easyFirstAddressMode);
  };


  SelectuseraddressHelper.prototype.showAllAddress = function(easyFirstAddressMode) {
    var that = this;

    that.removeAllAddressModal();
    utility.scrollTop(that.scrollTopPosition);

    that.allAddressModal = new userModalalladdressViewDef({
      userId: that.userId,
      easyFirstAddressMode: easyFirstAddressMode,
      enableZipCodeChange: that.enableZipCodeChange,
      selectAddressCallback: that.selectAddress,
      newAddressCallback: that.newAddress,
      editAddressCallback: that.editAddress,
      deleteAddressCallback: function(deletedUserAddress) {
        var currentDeliveryAddress = cookie.user.getAddress();
        if (currentDeliveryAddress && currentDeliveryAddress.id === deletedUserAddress.id.toString()) {
          cookie.user.clearAddress();
          if (that.addressChangeCallback) {
            var needToRefreshShoppingCart = false;
            that.addressChangeCallback(needToRefreshShoppingCart);
          }
        }
      },
      zipCodeChangeCallback: function(newZipCode) {
        var oldZipCode = (cookie.user.getZipCode() || "").toString();
        var oldDeliveryAddress = cookie.user.getAddress();
        if (oldDeliveryAddress || !newZipCode || newZipCode.toString() !== oldZipCode) {
          that.changeZipCode(oldZipCode, newZipCode);
        } else {
          cookie.user.clearAddress();
          if (that.zipCodeChangeCallback) {
            var needToRefreshShoppingCart = false;
            that.zipCodeChangeCallback(needToRefreshShoppingCart);
          }
          if (that.allAddressModal) {
            that.allAddressModal.hideModal();
          }
        }
      }
    });

    that.view.$el.append(that.allAddressModal.render().$el);
    that.allAddressModal.showModal();
  };


  SelectuseraddressHelper.prototype.changeZipCode = function(oldZipCode, newZipCode) {
    var that = this;

    that.removeBusyModal();
    utility.scrollTop(that.scrollTopPosition);

    that.busyModal = new mainModalbusyViewDef({
      header: "Update zip code",
      onVisibleCallback: function() {
        var allItemIdInCart = cartHelper.getAllItemIdInCart();
        if (allItemIdInCart.length === 0) {
          allItemIdInCart = null;   // Go to http://guides.rubyonrails.org/security.html#unsafe-query-generation for more information.
        }

        cachedRequest.fetchCollection(useraddressChangezipcodeCollection, {}, {
          type: "POST",

          data: {
            old_zip_code: oldZipCode,
            new_zip_code: newZipCode,
            user_id: that.userId,
            cart_id: cookie.cart.getCartId(),
            all_item_id_in_cart: allItemIdInCart
          },

          success: function(fetchedCollection) {
            cookie.user.setZipCode(newZipCode);
            cookie.user.setServiceAreaId(fetchedCollection.getServiceAreaId());
            cookie.user.clearAddress();
            useraddressIndexCollection.resetDefaultUserAddressInCache(null, that.userId);
            cookie.cart.removeUnavailableItemsInCart(fetchedCollection.getUnavailableItemsIdArray());

            if (!cookie.user.isServableArea()) {
              alerter(constant.text.NO_SERVICE_WARNING);
            }

            if (that.zipCodeChangeCallback) {
              var needToRefreshShoppingCart = true;
              that.zipCodeChangeCallback(needToRefreshShoppingCart);
            }
            if (that.busyModal) {
              that.busyModal.hideModal();
            }
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(["[helper/select_user_address] - ", jqXHR.responseJSON.error_message].join(""));
          }
        }, true);
      }
    });

    that.view.$el.append(that.busyModal.render().$el);
    that.busyModal.showModal();
  };


  SelectuseraddressHelper.prototype.selectAddress = function(userAddressId) {
    var that = this;

    that.removeBusyModal();
    utility.scrollTop(that.scrollTopPosition);

    that.busyModal = new mainModalbusyViewDef({
      header: "Changing address",
      loadingText: "One moment please ...",
      onVisibleCallback: function() {
        var allItemIdInCart = cartHelper.getAllItemIdInCart();
        if (allItemIdInCart.length === 0) {
          allItemIdInCart = null;   // Go to http://guides.rubyonrails.org/security.html#unsafe-query-generation for more information.
        }

        cachedRequest.fetchCollection(useraddressSelectAddressCollection, {}, {
          type: "POST",

          data: {
            id: userAddressId,
            set_as_default: true,
            old_zip_code: cookie.user.getZipCode(),
            cart_id: cookie.cart.getCartId(),
            all_item_id_in_cart: allItemIdInCart
          },

          success: function(fetchedCollection) {
            var selectAddressAttributes = fetchedCollection.getSelectedAddressAttributes();
            useraddressIndexCollection.resetDefaultUserAddressInCache(selectAddressAttributes.id, selectAddressAttributes.user_id);
            cookie.user.setAddressFromUseraddressModelAttributes(selectAddressAttributes);
            var oldZipCode = (cookie.user.getZipCode() || "").toString();
            var newZipCode = (selectAddressAttributes.zip_code || "").toString();
            cookie.user.setZipCode(newZipCode);
            cookie.user.setServiceAreaId(fetchedCollection.getServiceAreaId());
            cookie.cart.removeUnavailableItemsInCart(fetchedCollection.getUnavailableItemsIdArray());

            if (!cookie.user.isServableArea()) {
              alerter(constant.text.NO_SERVICE_WARNING);
            }

            if (that.addressChangeCallback) {
              var needToRefreshShoppingCart = (newZipCode !== oldZipCode);
              that.addressChangeCallback(needToRefreshShoppingCart);
            }
            if (that.busyModal) {
              that.busyModal.hideModal();
            }
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(["[helper/select_user_address] - ", jqXHR.responseJSON.error_message].join(""));
          }
        }, true);
      }
    });

    that.view.$el.append(that.busyModal.render().$el);
    that.busyModal.showModal();
  };


  SelectuseraddressHelper.prototype.newAddress = function(easyFirstAddressMode) {
    var that = this;

    that.removeNewAddressModal();
    utility.scrollTop(that.scrollTopPosition);

    that.newAddressModal = new userModaleditaddressViewDef({
      userId: that.userId,
      hideModalAfterSubmitSuccess: false,
      moreSubmitAttributes: {cart_zip_code: cookie.user.getZipCode()},
      submitSuccessCallback: function(newAddress) {
        if (newAddress.get("set_as_default")) {
          cookie.user.setAddressFromUseraddressModelAttributes(newAddress.attributes);
          if (that.addressChangeCallback) {
            var needToRefreshShoppingCart = false;
            that.addressChangeCallback(needToRefreshShoppingCart);
          }
          if (easyFirstAddressMode) {
            that.newAddressModal.hideModal();
          } else {
            that.showAllAddress();
          }
        } else {
          that.showAllAddress();
        }
      },
      denyCallback: function() {
        if (easyFirstAddressMode) {
          return true;
        } else {
          that.showAllAddress();
          return false;
        }
      }
    });

    that.view.$el.append(that.newAddressModal.render().$el);
    that.newAddressModal.showModal();
  };


  SelectuseraddressHelper.prototype.editAddress = function(userAddressId) {
    var that = this;

    that.removeEditAddressModal();
    utility.scrollTop(that.scrollTopPosition);

    that.editAddressModal = new userModaleditaddressViewDef({
      id: userAddressId,
      hideModalAfterSubmitSuccess: false,
      moreSubmitAttributes: {cart_zip_code: cookie.user.getZipCode()},
      submitSuccessCallback: function(updatedAddress) {
        var deliveryAddress = cookie.user.getAddress();
        if (deliveryAddress && deliveryAddress.id === updatedAddress.id.toString()) {
          if (updatedAddress.get("set_as_default")) {
            cookie.user.setAddressFromUseraddressModelAttributes(updatedAddress.attributes);
          } else {
            cookie.user.clearAddress();
          }
          if (that.addressChangeCallback) {
            var needToRefreshShoppingCart = false;
            that.addressChangeCallback(needToRefreshShoppingCart);
          }
        }
        that.showAllAddress();
      },
      denyCallback: function() {
        that.showAllAddress();
        return false;
      }
    });

    that.view.$el.append(that.editAddressModal.fetchAndRender().$el);
    that.editAddressModal.showModal();
  };


  SelectuseraddressHelper.prototype.removeBusyModal = function() {
    if (this.busyModal) {
      this.busyModal.remove();
      this.busyModal = null;
    }
  };


  SelectuseraddressHelper.prototype.removeAllAddressModal = function() {
    if (this.allAddressModal) {
      this.allAddressModal.remove();
      this.allAddressModal = null;
    }
  };


  SelectuseraddressHelper.prototype.removeNewAddressModal = function() {
    if (this.newAddressModal) {
      this.newAddressModal.remove();
      this.newAddressModal = null;
    }
  };


  SelectuseraddressHelper.prototype.removeEditAddressModal = function() {
    if (this.editAddressModal) {
      this.editAddressModal.remove();
      this.editAddressModal = null;
    }
  };


  SelectuseraddressHelper.prototype.removeAllModals = function() {
    utility.fixSemanticUiDimmerMemoryLeak();

    this.removeBusyModal();
    this.removeAllAddressModal();
    this.removeNewAddressModal();
    this.removeEditAddressModal();
  };


  return SelectuseraddressHelper;
});
