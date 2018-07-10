modulejs.define("view/order/guest_checkout", [
  "alerter",
  "confirmer",
  "jquery",
  "backbone",
  "jst",
  "app/constant",
  "app/utility",
  "app/navigator",
  "app/cookie",
  "app/cache",
  "helper/cart",
  "view/order/delivery_time",
  "view/user/modal_edit_address"
], function(
  alerter, confirmer, $, Backbone, JST, constant, utility, navigator, cookie, cache,
  cartHelper, orderDeliverytimeViewDef, userModaleditaddressViewDef
) {
  "use strict";


  var orderGuestcheckoutView = Backbone.View.extend({
    initialize: function() {
      this.currentModal = null;
      this.deliveryTimeView = null;
    },


    mainT: JST["template/order/guest_checkout/main"],
    orderSummaryTableT: JST["template/order/_order_summary_table"],
    addressT: JST["template/order/guest_checkout/_address"],


    render: function() {
      var token = cookie.tokenHandler.getToken();

      if (token) {
        if (cookie.user.isServableArea()) {
          if (token === constant.session.GUEST_TOKEN) {
            var totalValueInCart = cartHelper.getTotalValueInCart();
            var specialRequestArray = cartHelper.getSpecialRequestArray();

            if (totalValueInCart > 0.0 || specialRequestArray.length > 0) {
              var checkoutData = cache.orderGuestcheckoutData.get() || {};
              var address = checkoutData.address;
              var that = this;

              that.$el.html(that.mainT({
                constant: constant,
                totalValueInCart: totalValueInCart,
                address: address,
                addressTemplate: that.addressT,
                imagePathToUrlTool: utility.imagePathToUrl,
                orderSummaryTableT: that.orderSummaryTableT,
                navigator: navigator
              }));

              that.$("td").popup();
              that.$(".checkbox").checkbox();

              that.deliveryTimeView = new orderDeliverytimeViewDef({
                onChange: function(deliveryDate, deliveryTimeSlotStartTime, deliveryTimeSlotEndTime) {
                  var checkoutData = cache.orderGuestcheckoutData.get() || {};
                  checkoutData.delivery_date = deliveryDate;
                  checkoutData.delivery_time_slot_start_time = deliveryTimeSlotStartTime;
                  checkoutData.delivery_time_slot_end_time = deliveryTimeSlotEndTime;
                  cache.orderGuestcheckoutData.set(checkoutData, false);
                  that.$("#order-gcheckout-delivery-date").data("ready", "yes");
                  that.$("#order-gcheckout-delivery-date-error").addClass("hidden");
                },
                deliveryDate: checkoutData.delivery_date,
                deliveryTimeSlotStartTime: checkoutData.delivery_time_slot_start_time,
                deliveryTimeSlotEndTime: checkoutData.delivery_time_slot_end_time
              });
              that.$("#order-gcheckout-delivery-date").append(that.deliveryTimeView.render().$el);

              that.checkoutForm = that.$("#order-gcheckout-form");
              that.initializeCheckoutForm(that.checkoutForm);

              checkoutData.subscribe_news = (checkoutData.subscribe_news === "on");
              that.checkoutForm.form("set values", checkoutData);
            } else {
              alerter("Please add some available items into the cart before checkout.");
              navigator.cartManage({replace: true});
            }
          } else {
            navigator.orderUsercheckout({replace: true});
          }
        } else {
          alerter(constant.text.NO_SERVICE_WARNING);
          navigator.cartManage({replace: true});
        }
      } else {
        navigator.mainHome({replace: true});
      }

      return this;
    },


    initializeCheckoutForm: function(checkoutForm) {
      var that = this;

      var validateRule = constant.semanticUi.validateRule;

      checkoutForm.form({
        fields: {
          email: validateRule.EMAIL,
          phone: validateRule.PHONE_REQUIRED
        },

        onSuccess: function(event) {
          event.preventDefault();

          var ready = that.checkAddressAndPayment();
          var checkoutData = cache.orderGuestcheckoutData.get() || {};

          if (ready) {
            var submitButton = checkoutForm.find("#order-gcheckout-submit");
            submitButton.prop("disabled", true);
            submitButton.addClass("loading disabled");

            var formData = checkoutForm.form("get values");
            checkoutData.email = formData.email;
            checkoutData.phone = formData.phone;
            checkoutData.subscribe_news = formData.subscribe_news;
            cache.orderGuestcheckoutData.set(checkoutData, true);

            navigator.orderReview();
          } else {
            cache.orderGuestcheckoutData.set(checkoutData, false);
          }
          return false;
        },

        onFailure: function() {
          that.checkAddressAndPayment();
          var checkoutData = cache.orderGuestcheckoutData.get() || {};
          cache.orderGuestcheckoutData.set(checkoutData, false);
          return false;
        }
      });
    },


    checkAddressAndPayment: function() {
      var ready = true;

      if (this.$("#order-gcheckout-address").data("ready") === "no") {
        ready = false;
        this.$("#order-gcheckout-address-error").removeClass("hidden");
      }

      if (this.$("#order-gcheckout-payment").data("ready") === "no") {
        ready = false;
        this.$("#order-gcheckout-payment-error").removeClass("hidden");
      }

      if (this.$("#order-gcheckout-delivery-date").data("ready") === "no") {
        ready = false;
        this.$("#order-gcheckout-delivery-date-error").removeClass("hidden");
      }

      return ready;
    },


    events: {
      "click #order-gcheckout-new-address,.order-gcheckout-change-address": "editAddress",
      "click .order-gcheckout-remove-address": "removeAddress"
    },


    editAddress: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      var that = this;
      that.destroyCurrentModal();
      that.$("#order-gcheckout-address-error").addClass("hidden");
      var checkoutData = cache.orderGuestcheckoutData.get() || {};

      that.currentModal = new userModaleditaddressViewDef({
        guestUser: true,
        onlyValidateAddress: true,
        addressFormData: checkoutData.address,
        zipCode: cookie.user.getZipCode(),
        zipCodeChangeUrl: navigator.cartManageHash,
        zipCodeChangeWarningMessage: "Warning: some items in the shopping cart might be not available for other zip code.",

        submitSuccessCallback: function(validatedAddress) {
          var streetAddress = validatedAddress.get("street_address") || "";
          var city = validatedAddress.get("city") || "";
          var state = validatedAddress.get("state") || "";
          var zipCode = validatedAddress.get("zip_code") || "";

          var address = null;

          if (streetAddress.length > 0 && city.length > 0 && state.length > 0 && zipCode.length > 0) {
            address = {
              street_address: streetAddress,
              city: city,
              state: state,
              zip_code: zipCode,
              is_business_address: validatedAddress.get("is_business_address"),
              address_type: validatedAddress.get("address_type"),
              business_name: validatedAddress.get("business_name"),
              input_street_address: validatedAddress.get("input_street_address"),
              input_apt_number: validatedAddress.get("input_apt_number"),
              input_zip_code: validatedAddress.get("input_zip_code"),
              note: validatedAddress.get("note")
            };

            checkoutData.address = address;
          } else {
            checkoutData.address = {};
            alerter("Sorry, the address is invalid. Could you please try it again?");
          }

          that.$("#order-gcheckout-address-container").html(that.addressT({address: address}));
          cache.orderGuestcheckoutData.set(checkoutData);
        }
      });
      that.$el.append(that.currentModal.render().$el);
      that.currentModal.showModal();
    },


    removeAddress: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();
      if (confirmer("Are you sure to remove the address?")) {
        var checkoutData = cache.orderGuestcheckoutData.get() || {};
        checkoutData.address = {};
        cache.orderGuestcheckoutData.set(checkoutData);
        this.$("#order-gcheckout-address-container").html(this.addressT({address: null}));
      }
    },


    // to prevent memory leak
    destroyCurrentModal: function() {
      if (this.currentModal) {
        this.currentModal.remove();
      }
    },


    remove: function() {
      this.$("td").popup("destroy");
      this.$(".checkbox").checkbox("destroy");
      if (this.checkoutForm) {
        this.checkoutForm.form("destroy");
      }
      this.destroyCurrentModal();
      if (this.deliveryTimeView) {
        this.deliveryTimeView.remove();
      }
      Backbone.View.prototype.remove.call(this);
    }
  });


  return orderGuestcheckoutView;
});
