modulejs.define("view/order/user_checkout", [
  "alerter",
  "logger",
  "jquery",
  "backbone",
  "jst",
  "app/constant",
  "app/utility",
  "app/navigator",
  "app/cookie",
  "app/cache",
  "app/error_handler",
  "helper/cart",
  "helper/select_user_address",
  "helper/session",
  "view/order/delivery_time",
  "view/user/modal_edit_email",
  "view/user/modal_edit_phone"
], function(
  alerter, logger, $, Backbone, JST, constant, utility, navigator, cookie, cache, errorHandler,
  cartHelper, selectuseraddressHelper, sessionHelper, orderDeliverytimeViewDef,
  userModaleditemailViewDef, userModaleditphoneViewDef
) {
  "use strict";


  var orderGuestcheckoutView = Backbone.View.extend({
    initialize: function() {
      this.addressHelper = null;
      this.currentModal = null;
      this.deliveryTimeView = null;
    },


    mainT: JST["template/order/user_checkout/main"],
    orderSummaryTableT: JST["template/order/_order_summary_table"],
    addressT: JST["template/order/user_checkout/_address"],


    render: function() {
      var token = cookie.tokenHandler.getToken();

      if (token) {
        if (cookie.user.isServableArea()) {
          if (token !== constant.session.GUEST_TOKEN) {
            var totalValueInCart = cartHelper.getTotalValueInCart();
            var specialRequestArray = cartHelper.getSpecialRequestArray();

            if (totalValueInCart > 0.0 || specialRequestArray.length > 0) {
              var user = cookie.user.getSession().user;

              var that = this;

              that.addressHelper = new selectuseraddressHelper({
                userId: user.id,
                view: that,
                addressChangeCallback: function(needToRefreshShoppingCart) {
                  if (needToRefreshShoppingCart) {
                    navigator.cartManage({replace: true});
                  } else {
                    var addressContainer = that.$("#order-ucheckout-address-container");
                    addressContainer.empty();
                    addressContainer.append(that.addressT({
                      zipCode: cookie.user.getZipCode(),
                      address: cookie.user.getAddress(),
                    }));
                  }
                }
              });

              that.$el.html(that.mainT({
                userId: user.id,
                constant: constant,
                totalValueInCart: totalValueInCart,
                email: user.email,
                phone: user.phone,
                zipCode: cookie.user.getZipCode(),
                address: cookie.user.getAddress(),
                addressTemplate: that.addressT,
                imagePathToUrlTool: utility.imagePathToUrl,
                orderSummaryTableT: that.orderSummaryTableT,
                navigator: navigator
              }));

              that.$el.find("td").popup();
              that.$el.find(".checkbox").checkbox();

              var checkoutData = cache.orderUsercheckoutData.get() || {};
              that.deliveryTimeView = new orderDeliverytimeViewDef({
                onChange: function(deliveryDate, deliveryTimeSlotStartTime, deliveryTimeSlotEndTime) {
                  var checkoutData = cache.orderGuestcheckoutData.get() || {};
                  checkoutData.delivery_date = deliveryDate;
                  checkoutData.delivery_time_slot_start_time = deliveryTimeSlotStartTime;
                  checkoutData.delivery_time_slot_end_time = deliveryTimeSlotEndTime;
                  cache.orderUsercheckoutData.set(checkoutData, true);
                  that.$("#order-ucheckout-delivery-date").data("ready", "yes");
                  that.$("#order-ucheckout-delivery-date-error").addClass("hidden");
                },
                deliveryDate: checkoutData.delivery_date,
                deliveryTimeSlotStartTime: checkoutData.delivery_time_slot_start_time,
                deliveryTimeSlotEndTime: checkoutData.delivery_time_slot_end_time
              });
              that.$("#order-ucheckout-delivery-date").append(that.deliveryTimeView.render().$el);
            } else {
              alerter("Please add some available items into the cart before checkout.");
              navigator.cartManage({replace: true});
            }
          } else {
            navigator.guestUsercheckout({replace: true});
          }
        } else {
          navigator.cartManage({replace: true});
        }
      } else {
        navigator.mainHome({replace: true});
      }

      return this;
    },


    hasAllRequredInfo: function() {
      var ready = true;

      if (this.$("#order-ucheckout-address").data("ready") === "no") {
        ready = false;
        this.$("#order-ucheckout-address-error").removeClass("hidden");
      }

      if (this.$("#order-ucheckout-payment").data("ready") === "no") {
        ready = false;
        this.$("#order-ucheckout-payment-error").removeClass("hidden");
      }

      if (this.$("#order-ucheckout-phone").data("ready") === "no") {
        ready = false;
        this.$("#order-ucheckout-phone-error").removeClass("hidden");
      }

      if (this.$("#order-ucheckout-delivery-date").data("ready") === "no") {
        ready = false;
        this.$("#order-ucheckout-delivery-date-error").removeClass("hidden");
      }

      return ready;
    },


    events: {
      "click #order-ucheckout-submit": "onSubmit",
      "click #order-ucheckout-new-address": "newAddress",
      "click #order-ucheckout-change-address": "changeAddress",
      "click #order-ucheckout-edit-email": "editEmail",
      "click #order-ucheckout-edit-phone": "editPhone"
    },


    onSubmit: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();
      if (this.hasAllRequredInfo()) {
        navigator.orderReview();
      }
    },


    newAddress: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      if (this.addressHelper) {
        this.$("#order-ucheckout-address-error").addClass("hidden");
        var easyFirstAddress = true;
        this.addressHelper.start(easyFirstAddress);
      }
    },


    changeAddress: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      if (this.addressHelper) {
        this.$("#order-ucheckout-address-error").addClass("hidden");
        this.addressHelper.start();
      }
    },


    editEmail: function(event) {
      this.startEditEmailOrPhone(event, userModaleditemailViewDef);
    },


    editPhone: function(event) {
      this.$("#order-ucheckout-phone-error").addClass("hidden");
      this.startEditEmailOrPhone(event, userModaleditphoneViewDef);
    },


    startEditEmailOrPhone: function(event, modalViewDef) {
      event.preventDefault();
      var editButton = $(event.currentTarget);
      editButton.blur();
      var userId = editButton.data("userId");

      var that = this;
      that.destroyCurrentModal();
      that.currentModal = new modalViewDef({
        userId: userId,
        updateSuccessCallback: function(updatedUser) {
          if (sessionHelper.updateSession(null, updatedUser.attributes)) {
            navigator.refresh();
          } else {
            var errorMessage = "Fail to update the session.";
            logger(errorMessage);
            errorHandler(errorMessage);
          }
        }
      });
      that.$el.append(that.currentModal.render().$el);
      that.currentModal.showModal();
    },


    // to prevent memory leak
    destroyCurrentModal: function() {
      if (this.currentModal) {
        this.currentModal.remove();
      }
    },


    remove: function() {
      this.$el.find("td").popup("destroy");
      this.$el.find(".checkbox").checkbox("destroy");
      this.destroyCurrentModal();
      if (this.addressHelper) {
        this.addressHelper.removeAllModals();
      }
      if (this.deliveryTimeView) {
        this.deliveryTimeView.remove();
      }
      Backbone.View.prototype.remove.call(this);
    }
  });


  return orderGuestcheckoutView;
});
