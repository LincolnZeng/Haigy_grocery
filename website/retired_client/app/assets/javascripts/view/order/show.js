modulejs.define("view/order/show", [
  "alerter",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/navigator",
  "app/utility",
  "app/cookie",
  "app/cache",
  "app/error_handler",
  "app/cached_request",
  "app/precompiled_asset",
  "helper/cart",
  "view/user/modal_sign_in",
  "model/order",
  "collection/cart_entry/synchronize_all"
], function(
  alerter, logger, Backbone, $, JST, constant, navigator, utility, cookie, cache, errorHandler, cachedRequest,
  precompiledAsset, cartHelper, userModalsigninViewDef, orderModel, cartentrySynchronizeallCollection
) {
  "use strict";


  var orderShowView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id.toString();
    },


    mainT: JST["template/order/show/main"],
    signInRequiredT: JST["template/order/show/_sign_in_required"],
    guestOrderProtectorT: JST["template/order/show/_guest_order_protector"],
    errorMessageT: JST["template/order/show/_error_message"],
    loadingT: JST["template/main/loading"],
    orderSummaryTableT: JST["template/order/_order_summary_table"],
    itemListT: JST["template/order/_item_list"],


    render: function() {
      var token = cookie.tokenHandler.getToken();

      if (this.id.charAt(0) === "u") {   // user order
        if (token && token !== constant.session.GUEST_TOKEN) {
          this.renderOrder();
        } else {
          this.$el.html(this.signInRequiredT());
        }
      } else {   // guest order
        var email = cache.guestOrderViewPermission.getOrderEmailIfHasPermission(this.id);
        if (email) {
          this.renderOrder({email: email});
        } else {
          this.$el.html(this.guestOrderProtectorT({constant: constant}));
          this.guestOrderProtectorForm = this.$("#order-show-guest-order-protector-form");
          this.initializeGuestOrderProtectorForm(this.guestOrderProtectorForm);
        }
      }

      return this;
    },


    initializeGuestOrderProtectorForm: function(guestOrderProtectorForm) {
      var that = this;

      guestOrderProtectorForm.form({
        fields: {
          email: constant.semanticUi.validateRule.EMAIL
        },

        onSuccess: function(event) {
          event.preventDefault();
          var protectorForm = $(event.currentTarget);
          protectorForm.addClass("loading");
          var email = (protectorForm.form("get values").email || "").trim().toLowerCase();

          that.renderOrder({email: email});

          return false;
        }
      });
    },


    renderOrder: function(otherParameters) {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchModel(orderModel, that.id, {
        fetchParameters: otherParameters,

        success: function(fetchedOrder) {
          var cartEntryCollection = new cartentrySynchronizeallCollection(fetchedOrder.get("cart_entry"), {
            specialRequestsInJsonFormat: fetchedOrder.get("special_requests")
          });
          var allCartEntries = cartHelper.parseServerResponse(cartEntryCollection, false, true);

          if (fetchedOrder.get("is_guest_order") === true) {
            cache.guestOrderViewPermission.grantPermission(fetchedOrder.id, (otherParameters || {}).email);
          }

          var token = cookie.tokenHandler.getToken();

          that.$el.html(that.mainT({
            token: token,
            order: fetchedOrder,
            cart: allCartEntries,
            totalValueInCart: cartHelper.getTotalValueInCart(allCartEntries),
            specialRequestArray: cartEntryCollection.getSpecialRequests(),
            orderSummaryTableT: that.orderSummaryTableT,
            itemListT: that.itemListT,
            constant: constant,
            navigator: navigator,
            precompiledAsset: precompiledAsset,
            utility: utility
          }));

          that.$("td").popup();
        },

        error: function(model, jqXHR) {
          if (jqXHR && jqXHR.responseJSON) {
            switch (jqXHR.responseJSON.error_code) {
              case constant.errorCode.NOT_ALLOWED:
                that.$el.html(that.errorMessageT({errorMessage: jqXHR.responseJSON.error_message}));
                break;
              case constant.errorCode.PARAMETERS_NOT_CORRECT:
                alerter(jqXHR.responseJSON.error_message);
                navigator.refresh();
                break;
              default:
                logger(jqXHR);
                errorHandler(["[view/order/view] - ", jqXHR.responseJSON.error_message].join(""));
            }
          } else {
            var otherError = "[view/order/view] - other error, may be caused by an invalid JSON response.";
            logger(otherError);
            errorHandler(otherError);
          }
        }
      }, true);
    },


    events: {
      "click #order-show-reorder": "reorder",
      "click #order-show-sign-in": "signIn"
    },


    reorder: function(event) {
      event.preventDefault();
      var button = $(event.currentTarget);
      button.addClass("disabled loading");
      button.blur();

      var allItemContainers = $(".order-item-list-item-container");
      var cartEntryIndex = allItemContainers.length;
      allItemContainers.each(function() {
        var itemContainer = $(this);
        var itemId = itemContainer.data("itemId");
        var quantity = parseFloat(itemContainer.data("quantity"));
         cartHelper.updateItemQuantity(itemId, cartHelper.getItemQuantityInCart(itemId) + quantity, cartEntryIndex);
         --cartEntryIndex;
      });

      button.html("Items have been added to cart");
      button.removeClass("loading");
    },


    signIn: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      this.destroyCurrentModal();
      this.currentModal = new userModalsigninViewDef({closable: true});
      this.$el.append(this.currentModal.render().$el);
      this.currentModal.showModal();
    },


    // to prevent memory leak
    destroyCurrentModal: function() {
      if (this.currentModal) {
        this.currentModal.remove();
        this.currentModal = null;
      }
    },


    remove: function() {
      this.$("td").popup("destroy");
      if (this.guestOrderProtectorForm) {
        this.guestOrderProtectorForm.form("destroy");
      }
      this.destroyCurrentModal();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return orderShowView;
});
