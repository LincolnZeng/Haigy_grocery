modulejs.define("view/order/show", [
  "alerter",
  "logger",
  "confirmer",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/navigator",
  "app/utility",
  "app/error_handler",
  "app/cached_request",
  "app/precompiled_asset",
  "model/order",
  "collection/cart_entry/index",
  "model/cart_entry"
], function(alerter, logger, confirmer, Backbone, $, JST, constant, navigator, utility, errorHandler,
  cachedRequest, precompiledAsset, orderModel, cartentryIndexCollection, cartentryModel
) {
  "use strict";

  var orderShowView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id;
    },

    mainT: JST["template/order/show"],
    loadingT: JST["template/main/loading"],

    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchModel(orderModel, that.id, {
        success: function(fetchedOrder) {

          cachedRequest.fetchCollection(cartentryIndexCollection, {cartId: fetchedOrder.get("cart_id")}, {
            success: function(fetchedCollection) {
              that.$el.html(that.mainT({
                order: fetchedOrder,
                allEntry: fetchedCollection,
                constant: constant,
                navigator: navigator,
                utility: utility,
                precompiledAsset: precompiledAsset
              }));
            },

            error: function(collection, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/order/show] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });

        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/order/show] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return this;
    },

    updateCartDisplay: function(cartEntry) {
      if (cartEntry) {
        var itemId = cartEntry.get("item_id");
        var quantity = cartEntry.get("quantity");
        var unitPrice = cartEntry.get("unit_price");

        this.$(["#order-show-item-", itemId, "-quantity"].join("")).html(quantity);
        if (quantity === 0) {
          this.$(["#order-show-item-", itemId, "-quantity"].join("")).addClass("haigy-font-color-warning");
        } else {
          this.$(["#order-show-item-", itemId, "-quantity"].join("")).removeClass("haigy-font-color-warning");
        }
        var unitPriceElement = this.$(["#order-show-item-", itemId, "-unit-price"].join(""));
        var estimateTotalElement = this.$(["#order-show-item-", itemId, "-total"].join(""));
        if (unitPrice) {
          unitPrice = parseFloat(unitPrice) || 0.0;
          unitPriceElement.html(["$", unitPrice.toFixed(2)].join(""));
          var totalPrice = unitPrice * parseFloat(quantity);
          estimateTotalElement.html(["$", totalPrice.toFixed(2)].join(""));
          estimateTotalElement.data("total", totalPrice);
        } else {
          unitPriceElement.html("Unknown");
          estimateTotalElement.html("Unknown");
          estimateTotalElement.data("total", "0.0");
        }

        var totalValueInCart = 0;
        var allEstimateTotalElements = this.$(".order-show-item-total");

        allEstimateTotalElements.each(function() {
          totalValueInCart += parseFloat($(this).data("total"));
        });

        var deliveryFee = parseFloat($("#order-show-delivery-fee").data("deliveryFee"));
        var totalValue = totalValueInCart + deliveryFee;

        this.$("#order-show-item-in-cart").html(totalValueInCart.toFixed(2));
        var totalValueElement = this.$("#order-show-totalvalue");
        totalValueElement.html(totalValue.toFixed(2));
        totalValueElement.data("totalAmount", totalValue.toFixed(2));

      }
    },

    events: {
      "click #order-show-edit-status-enable": "onEditEnabled",
      "click #order-show-edit-status-submit": "onSubmit",
      "click #order-show-edit-status-cancel": "onCancel",
      "click .order-show-edit-item-quantity-enabled": "onEditItemEnabled",
      "click .order-show-edit-item-quantity-cancel": "onEditItemCancel",
      "click .order-show-edit-item-quantity-save": "onEditItemSave",
      "click #order-show-edit-change-delivery-fee": "onChangeDeliveryFee",
      "click #order-show-edit-cancel-delivery-fee-change": "onCancelDeliveryFeeChange",
      "click #order-show-edit-save-new-delivery-fee": "onSaveNewDeliveryFee",
      "click #order-show-collect-stripe-payment-button": "collectStripePayment",
      "click #order-show-mark-as-paid-button": "markAsPaid"
    },

    onEditEnabled: function() {
      this.$("#order-show-edit-status-enable").hide();
      this.$("#order-show-edit-status-section").show();
    },

    onCancel: function() {
      this.$("#order-show-edit-status-section").hide();
      this.$("#order-show-edit-status-enable").show();
    },

    onSubmit: function() {
      var that = this;

      var orderData = {
        id: this.id,
        status: this.$("#order-show-get-order-status").val().trim()
      };

      cachedRequest.saveModel(orderModel, orderData, {
        success: function(savedModel) {
          that.$("#order-show-edit-status-section").hide();
          that.$("#order-show-order-status").html(utility.getOrderStatus(savedModel.get("status")));
          that.$("#order-show-edit-status-enable").show();
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/order/show] - ", jqXHR.responseJSON.error_message].join(""));
        }

      });

    },


    onEditItemEnabled: function(event) {
      var enableButton = $(event.currentTarget);
      var itemId = enableButton.data("itemId");

      this.$(["#order-show-edit-item-", itemId, "-quantity-button"].join("")).show();
      this.$(["#order-show-edit-item-", itemId, "-quantity-input"].join("")).show();
      enableButton.hide();

    },


    onEditItemCancel: function(event) {
      var that = this;
      var cancelButton = $(event.currentTarget);
      var itemId = cancelButton.data("itemId");
      that.$(["#order-show-edit-item-", itemId, "-quantity-button"].join("")).hide();
      that.$(["#order-show-edit-item-", itemId, "-quantity-input"].join("")).hide();
      that.$(["#order-show-edit-item-", itemId, "-quantity-warning"].join("")).empty();
      that.$(["#order-show-edit-item-", itemId, "-quantity-enabled"].join("")).show();
    },


    onEditItemSave: function(event) {
      var that = this;
      var saveButton = $(event.currentTarget);
      var itemId = saveButton.data("itemId");
      var id = saveButton.data("id");
      var price = that.$(["#order-show-get-item-", itemId, "-price"].join("")).val();
      var quantity = that.$(["#order-show-get-item-", itemId, "-quantity"].join("")).val();
      price = parseFloat(price);
      quantity = parseFloat(quantity);

      if(isNaN(price) || isNaN(quantity) || price <= 0.0 || quantity < 0) {
        that.$(["#order-show-edit-item-", itemId, "-quantity-warning"].join("")).html("Inputted price or quantity is not correct.");
        this.$(["#order-show-edit-item-", itemId, "-quantity-warning"].join("")).addClass("haigy-font-color-warning");
      } else {
        var cartEntryAttributes = {
          id: id,
          quantity: quantity,
          unit_price: price
        };

        cachedRequest.saveModel(cartentryModel, cartEntryAttributes, {
          success: function(savedModel) {
            that.updateCartDisplay(savedModel);
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/order/show] - ", jqXHR.responseJSON.error_message].join(""));
          }

        });

        //hide input and submit button after change quantity
        that.$(["#order-show-edit-item-", itemId, "-quantity-button"].join("")).hide();
        that.$(["#order-show-edit-item-", itemId, "-quantity-input"].join("")).hide();
        that.$(["#order-show-edit-item-", itemId, "-quantity-enabled"].join("")).show();
        that.$(["#order-show-edit-item-", itemId, "-quantity-warning"].join("")).empty();
      }
    },


    onChangeDeliveryFee: function() {
      this.$("#order-show-edit-change-delivery-fee").hide();
      this.$("#order-show-edit-delivery-fee-change-section").show();
    },


    onCancelDeliveryFeeChange: function() {
      this.$("#order-show-edit-change-delivery-fee").show();
      this.$("#order-show-edit-delivery-fee-change-section").hide();
    },


    onSaveNewDeliveryFee: function() {
      var newDeliveryFee = parseFloat(this.$("#order-show-new-delivery-fee").val());
      if (isNaN(newDeliveryFee)) {newDeliveryFee = 0.0;}
      if (newDeliveryFee < 0) {newDeliveryFee = 0.0;}

      var orderData = {
        id: this.id,
        delivery_fee: newDeliveryFee
      };

      cachedRequest.saveModel(orderModel, orderData, {
        success: function() {
          navigator.refresh();
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/order/show] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });
    },


    collectStripePayment: function(event) {
      event.preventDefault();
      var button = $(event.currentTarget);
      button.prop("disabled", true);

      var that = this;

      confirmer("Are you sure to collect the Stripe payment for this order?", function() {
        var totalAmountToBePaid = parseFloat(that.$("#order-show-totalvalue").data("totalAmount"));
        if (!isNaN(totalAmountToBePaid) && totalAmountToBePaid > 0) {
          var orderData = {
            id: that.id,
            total_amount_paid: totalAmountToBePaid,
            is_stripe_payment: true
          };

          cachedRequest.saveModel(orderModel, orderData, {
            success: function() {
              navigator.refresh();
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/order/show] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
        } else {
          button.prop("disabled", false);
          alerter("Total amount to be paid is not correct!");
        }
      }, function() {
        button.prop("disabled", false);
      }).open();
    },


    markAsPaid: function(event) {
      event.preventDefault();
      var button = $(event.currentTarget);
      button.prop("disabled", true);

      var that = this;

      confirmer("Are you sure to mark this order as paid?", function() {
        var totalAmountToBePaid = parseFloat(that.$("#order-show-totalvalue").data("totalAmount"));
        if (!isNaN(totalAmountToBePaid) && totalAmountToBePaid > 0) {
          var orderData = {
            id: that.id,
            total_amount_paid: totalAmountToBePaid,
            is_stripe_payment: false
          };

          cachedRequest.saveModel(orderModel, orderData, {
            success: function() {
              navigator.refresh();
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/order/show] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
        } else {
          button.prop("disabled", false);
          alerter("Total amount to be paid is not correct!");
        }
      }, function() {
        button.prop("disabled", false);
      }).open();
    }
  });

  return orderShowView;
});
