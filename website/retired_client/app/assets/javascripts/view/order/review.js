modulejs.define("view/order/review", [
  "alerter",
  "logger",
  "backbone",
  "jst",
  "app/constant",
  "app/cache",
  "app/cookie",
  "app/utility",
  "app/navigator",
  "app/error_handler",
  "app/cached_request",
  "app/precompiled_asset",
  "helper/cart",
  "model/order",
  "collection/cart_entry/synchronize_all"
], function(
  alerter, logger, Backbone, JST, constant, cache, cookie, utility, navigator, errorHandler,
  cachedRequest, precompiledAsset, cartHelper, orderModel, cartentrySynchronizeallCollection
) {
  "use strict";


  var orderReviewView = Backbone.View.extend({
    initialize: function() {
      this.orderData = null;
    },


    mainT: JST["template/order/review/main"],
    orderSummaryTableT: JST["template/order/_order_summary_table"],
    itemListT: JST["template/order/_item_list"],
    placedOrderT: JST["template/order/review/placed_order"],


    render: function() {
      var that = this;
      var token = cookie.tokenHandler.getToken();

      if (token) {
        if (cookie.user.isServableArea()) {
          var orderData = null;
          if (token === constant.session.GUEST_TOKEN) {
            orderData = cache.orderGuestcheckoutData.get();
            if (orderData && orderData.ready === true) {
              this.orderData = orderData;
              that.renderHelper(orderData);
            } else {
              navigator.orderGuestcheckout({replace: true});
            }
          } else {
            orderData = cache.orderUsercheckoutData.get();
            if (orderData && orderData.ready === true) {
              var user = cookie.user.getSession().user;
              var email = user.email;
              var phone = user.phone;
              var address = cookie.user.getAddress();
              if (email && phone && address) {
                orderData.email = email;
                orderData.phone = phone;
                orderData.address = {
                  is_business_address: address.isBusinessAddress,
                  business_name: address.businessName,
                  street_address: address.streetAddress,
                  city: address.city,
                  state: address.state,
                  zip_code: address.zip_code,
                  note: address.note
                };
                this.orderData = orderData;
                that.renderHelper(orderData);
              } else {
                navigator.orderUsercheckout({replace: true});
              }
            } else {
              navigator.orderUsercheckout({replace: true});
            }
          }
        } else {
          navigator.cartManage({replace: true});
        }
      } else {
        navigator.mainHome({replace: true});
      }

      return that;
    },


    renderHelper: function(orderData) {
      var allCartEntries = cartHelper.getAllCartEntrySorted().reverse();
      var totalValueInCart = cartHelper.getTotalValueInCart(allCartEntries);
      var specialRequestArray = cartHelper.getSpecialRequestArray();

      if (totalValueInCart > 0.0 || specialRequestArray.length > 0) {
        this.$el.html(this.mainT({
          orderData: orderData,
          cart: allCartEntries,
          totalValueInCart: totalValueInCart,
          specialRequestArray: specialRequestArray,
          orderSummaryTableT: this.orderSummaryTableT,
          itemListT: this.itemListT,
          constant: constant,
          navigator: navigator,
          precompiledAsset: precompiledAsset,
          utility: utility
        }));

        this.$("td").popup();
      } else {
        navigator.cartManage({replace: true});
      }
    },


    events: {
      "click .order-review-back": "backToCheckout",
      "click .order-review-place-order": "placeOrder"
    },


    backToCheckout: function() {
      var token = cookie.tokenHandler.getToken();

      if (token) {
        if (token === constant.session.GUEST_TOKEN) {
          navigator.orderGuestcheckout();
        } else {
          navigator.orderUsercheckout();
        }
      } else {
        navigator.mainHome({replace: true});
      }
    },


    placeOrder: function(event) {
      event.preventDefault();
      var placeOrderButtons = this.$el.find(".order-review-place-order");
      placeOrderButtons.prop("disabled", true);
      placeOrderButtons.addClass("loading disabled");

      var token = cookie.tokenHandler.getToken();

      if (token) {
        var that = this;

        if (that.orderData && that.$(".order-review-error").length === 0) {
          var data = that.orderData;
          var address = data.address || {};
          var orderAttributes = {};

          orderAttributes.is_business_address = address.is_business_address;
          orderAttributes.business_name = address.business_name;
          orderAttributes.street_address = address.street_address;
          orderAttributes.city = address.city;
          orderAttributes.state = address.state;
          orderAttributes.zip_code = address.zip_code;
          orderAttributes.note = address.note;

          orderAttributes.delivery_date = data.delivery_date;
          orderAttributes.delivery_time_slot_start_time = data.delivery_time_slot_start_time;
          orderAttributes.delivery_time_slot_end_time = data.delivery_time_slot_end_time;

          if (token === constant.session.GUEST_TOKEN) {
            orderAttributes.is_guest_order = true;
            orderAttributes.cart = cartHelper.getServerRequiredCartInfo(true, true);
            orderAttributes.email = data.email;
            orderAttributes.subscribe_news = (data.subscribe_news === "on");
            orderAttributes.phone = data.phone;
            orderAttributes.special_requests = cartHelper.getSpecialRequestsInJsonFormat();
          } else {
            var user = cookie.user.getSession().user;

            orderAttributes.cart_id = cartHelper.getCartId();
            orderAttributes.cart = cartHelper.getServerRequiredCartInfo(true);
            orderAttributes.is_guest_order = false;
            orderAttributes.user_id = user.id;
            orderAttributes.email = user.email;
            orderAttributes.phone = user.phone;
          }

          cachedRequest.saveModel(orderModel, orderAttributes, {
            success: function(placedOrder) {
              cartHelper.clearCart(false);
              cache.orderGuestcheckoutData.clear();
              cache.orderUsercheckoutData.clear();
              var isGuestOrder = placedOrder.get("is_guest_order") === true;
              if (isGuestOrder) {
                cache.guestOrderViewPermission.grantPermission(placedOrder.id, orderAttributes.email);
              }
              that.$el.html(that.placedOrderT({order: placedOrder, isGuestOrder: isGuestOrder, constant: constant, navigator: navigator}));
            },

            error: function(model, jqXHR) {
              if (jqXHR.responseJSON.error_code == constant.errorCode.ITEM_INFO_OUTDATED) {
                var token = cookie.tokenHandler.getToken();
                var synchronizeOptions = {zip_code: cartHelper.getZipCode()};
                if (token === constant.session.GUEST_TOKEN) {
                  synchronizeOptions.cart = cartHelper.getServerRequiredCartInfo(false, true);
                } else {
                  synchronizeOptions.cart_id = cartHelper.getCartId();
                }

                cachedRequest.fetchCollection(cartentrySynchronizeallCollection, {}, {
                  type: "POST",

                  data: synchronizeOptions,

                  success: function(fetchedCollection) {
                    cache.clearCachedRequestCache();
                    cache.lastScrollPositionData.clear();
                    cartHelper.parseServerResponse(fetchedCollection, true, false);
                    alerter("The information of some items in the cart is outdated. Please check it.");
                    navigator.cartManage();
                  },

                  error: function(model, jqXHR) {
                    logger(jqXHR);
                    errorHandler(["[view/order/review] - ", jqXHR.responseJSON.error_message].join(""));
                  }
                }, true);

              } else {
                logger(jqXHR);
                errorHandler(["[view/order/review] - ", jqXHR.responseJSON.error_message].join(""));
              }
            }
          });
        } else {
          alerter("Sorry, the order cannot be placed because some error.");
          placeOrderButtons.prop("disabled", false);
          placeOrderButtons.removeClass("loading disabled");
        }
      } else {
        navigator.mainHome({replace: true});
      }
    },


    remove: function() {
      this.$("td").popup("destroy");
      Backbone.View.prototype.remove.call(this);
    }
  });


  return orderReviewView;
});
