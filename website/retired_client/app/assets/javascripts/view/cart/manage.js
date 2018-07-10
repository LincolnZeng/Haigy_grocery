modulejs.define("view/cart/manage", [
  "alerter",
  "jquery",
  "backbone",
  "jst",
  "app/constant",
  "app/navigator",
  "app/utility",
  "app/cookie",
  "app/precompiled_asset",
  "helper/cart",
  "helper/select_user_address"
], function(alerter, $, Backbone, JST, constant, navigator, utility, cookie,
  precompiledAsset, cartHelper, selectuseraddressHelper
) {
  "use strict";


  var cartManageView = Backbone.View.extend({
    initialize: function(options) {
      this.customizeLayout = options.customizeLayout;
      this.addressHelper = null;
    },


    mainT: JST["template/cart/manage/main"],
    addressT: JST["template/cart/manage/_address"],


    render: function() {
      var that = this;

      var signedIn = false;
      var token = cookie.tokenHandler.getToken();
      if (token && token !== constant.session.GUEST_TOKEN) {
        signedIn = true;
      }

      var address = cookie.user.getAddress();
      var zipCode = cookie.user.getZipCode();

      var userId = null;
      if (signedIn) {
        userId = cookie.user.getSession().user.id;
      }

      that.addressHelper = new selectuseraddressHelper({
        userId: userId,
        view: that,
        enableZipCodeChange: true,
        addressChangeCallback: function(needToRefreshShoppingCart) {
          if (needToRefreshShoppingCart) {
            navigator.refresh();
          } else {
            that.refreshAddressContainer();
          }
        },
        zipCodeChangeCallback: function(needToRefreshShoppingCart) {
          if (needToRefreshShoppingCart) {
            navigator.refresh();
          } else {
            that.refreshAddressContainer();
          }
        }
      });

      that.customizeLayout();

      that.$el.html(that.mainT({
        cart: cartHelper.getAllCartEntrySorted().reverse(),
        specialRequestArray: cartHelper.getSpecialRequestArray(),
        signedIn: signedIn,
        address: address,
        zipCode: zipCode,
        addressT: that.addressT,
        constant: constant,
        navigator: navigator,
        precompiledAsset: precompiledAsset,
        utility: utility
      }));

      that.updateCartDisplay();

      return that;
    },


    refreshAddressContainer: function() {
      var address = cookie.user.getAddress();
      var zipCode = cookie.user.getZipCode();
      var addressContainer = this.$("#cart-manage-address-container");
      addressContainer.empty();
      addressContainer.append(this.addressT({address: address, zipCode: zipCode}));
    },


    events: {
      "click .cart-manage-guest-checkout": "guestCheckout",
      "click .cart-manage-user-checkout": "userCheckout",
      "click #cart-manage-change-address,#cart-manage-change-zip-code": "changeAddressOrZipCode",
      "click .cart-manage-add-quantity": "addQuantity",
      "click .cart-manage-subtract-quantity": "subtractQuantity",
      "click .cart-manage-remove-item": "removeItem",
      "click .cart-manage-edit-special-request": "editSpecialRequest"
    },


    guestCheckout: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      if (cookie.user.isServableArea()) {
        navigator.orderGuestcheckout();
      } else {
        alerter(constant.text.NO_SERVICE_WARNING);
      }
    },


    userCheckout: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      if (cookie.user.isServableArea()) {
        navigator.orderUsercheckout();
      } else {
        alerter(constant.text.NO_SERVICE_WARNING);
      }
    },


    changeAddressOrZipCode: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      if (this.addressHelper) {
        this.addressHelper.start();
      }
    },


    updateCartDisplay: function(cartEntry) {
      if (cartEntry && cartEntry.inStock === true) {
        var itemId = cartEntry.itemId;
        var quantity = cartEntry.quantity;
        var unitPrice = cartEntry.unitPrice;
        this.$(["#cart-manage-item-quantity-", itemId].join("")).html(quantity);
        var unitPriceElement = this.$(["#cart-manage-item-unit-price-", itemId].join(""));
        var totalElement = this.$(["#cart-manage-item-total-", itemId].join(""));
        if (unitPrice) {
          unitPrice = parseFloat(unitPrice);
          unitPriceElement.html(["$", unitPrice.toFixed(2)].join(""));
          var totalPrice = unitPrice * parseFloat(quantity);
          totalElement.html(["$", totalPrice.toFixed(2)].join(""));
          totalElement.data("total", totalPrice);
        } else {
          unitPriceElement.html("Unknown");
          totalElement.html("Unknown");
          totalElement.data("total", "0.0");
        }
      }

      var sum = 0;
      var allItemContainers = this.$(".cart-manage-item-container");
      if (allItemContainers.length === 0) {
        this.$el.find("#cart-manage-all-items").html(["No Items In The Cart, <a href='", navigator.mainHomeHash, "'>Click Here</a> to Start Shopping!"].join(""));
      }
      var allTotalElements = this.$(".cart-manage-item-total");
      allTotalElements.each(function() {
        sum += parseFloat($(this).data("total"));
      });
      this.$("#cart-manage-summary-top").html(sum.toFixed(2));
      this.$("#cart-manage-summary-bottom").html(sum.toFixed(2));
    },


    addQuantity: function(event) {
      var that = this;
      var addButton = $(event.currentTarget);
      addButton.blur();
      var itemId = addButton.data("itemId");
      cartHelper.addItemQuantity(itemId, function(cartEntry) {
        that.updateCartDisplay(cartEntry);
      });
    },


    subtractQuantity: function(event) {
      var that = this;
      var subtractButton = $(event.currentTarget);
      subtractButton.blur();
      var itemId = subtractButton.data("itemId");
      cartHelper.subtractItemQuantity(itemId, function(cartEntry) {
        if (cartEntry && cartEntry.quantity > 0) {
          that.updateCartDisplay(cartEntry);
        } else {
          that.$(["#cart-manage-item-", itemId].join("")).remove();
          that.updateCartDisplay();
        }
      });
    },


    removeItem: function(event) {
      var that = this;
      var removeButton = $(event.currentTarget);
      removeButton.blur();
      var itemId = removeButton.data("itemId");
      cartHelper.removeItem(itemId, function() {
        that.$el.find(["#cart-manage-item-", itemId].join("")).remove();
        that.updateCartDisplay();
      });
    },


    editSpecialRequest: function(event) {
      event.preventDefault();
      var link = $(event.currentTarget);
      link.blur();
      navigator.cartSpecialrequest(JSON.stringify({id: link.data("specialRequestId"), cancelUrl: navigator.cartManageHash}), {replace: true});
    },


    remove: function() {
      if (this.addressHelper) {
        this.addressHelper.removeAllModals();
      }
      Backbone.View.prototype.remove.call(this);
    }
  });


  return cartManageView;
});
