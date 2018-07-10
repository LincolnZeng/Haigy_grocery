modulejs.define("view/detailed_info_item/show", [
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/precompiled_asset",
  "app/cookie",
  "app/cached_request",
  "app/navigator",
  "app/utility",
  "app/error_handler",
  "helper/cart",
  "model/detailed_info_item",
  "view/main/modal_image_zoomer",
  "view/user/modal_sign_in"
], function(
  logger, Backbone, $, JST, constant, precompiledAsset, cookie, cachedRequest, navigator, utility,
  errorHandler, cartHelper, detailedinfoitemModel, mainModalimagezoomerViewDef, userModalsigninViewDef
) {
  "use strict";


  var detailedinfoitemShowView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id;
      this.userSigninModal = null;
      this.mainImagezoomerModal = null;
    },


    mainT: JST["template/detailed_info_item/show/main"],
    loadingT: JST["template/main/loading"],
    categoryPathT: JST["template/main/_category_path"],
    cartOperationT: JST["template/detailed_info_item/show/_cart_operation"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      var zipCode = cookie.user.getZipCode();

      cachedRequest.fetchModel(detailedinfoitemModel, that.id, {
        fetchParameters: {zip_code: zipCode},

        success: function(fetchedItem) {
          that.$el.html(that.mainT({
            item: fetchedItem,
            itemUnit: fetchedItem.get("unit"),
            categoryPathT: that.categoryPathT,
            imagePathToUrlTool: utility.imagePathToUrl,
            precompiledAsset: precompiledAsset,
            navigator: navigator,
            constant: constant
          }));

          that.refreshCartOperation();
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(["[view/detailed_info_item/show] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    refreshCartOperation: function() {
      var token = cookie.tokenHandler.getToken();
      var quantityInCart = cartHelper.getItemQuantityInCart(this.id);
      var cartOperationContainer = this.$("#diitem-show-cart-operation");
      var itemUnit = cartOperationContainer.data("itemUnit");
      var inStock = (cartOperationContainer.data("inStock") === "yes");
      cartOperationContainer.empty();
      cartOperationContainer.append(this.cartOperationT({
        token: token,
        itemQuantity: quantityInCart,
        itemUnit: itemUnit,
        inStock: inStock
      }));
    },


    events: {
      "click .diitem-show-thumb-image": "showLargeImage",
      "click .diitem-show-large-image": "showLargeImageZoomer",
      "click #diitem-show-add-to-cart,#diitem-show-add-quantity": "addQuantity",
      "click #diitem-show-subtract-quantity": "subtractQuantity",
      "click #diitem-show-remove-item": "removeItem",
      "click #diitem-show-start-shopping": "startShopping"
    },


    showLargeImage: function(event) {
      var thumbImage = $(event.currentTarget);
      var largeImageContainer = this.$("#diitem-show-large-image-container");
      var newLargeImage = $([
        "<img class='ui centered image haigy-image-max-fluid diitem-show-large-image' src='",
        thumbImage.data("largeUrl"),
        "' alt='item image'>"
      ].join(""));
      largeImageContainer.empty();
      largeImageContainer.append(newLargeImage);
    },


    showLargeImageZoomer: function(event) {
      this.destroyCurrentModal();
      this.mainImagezoomerModal = new mainModalimagezoomerViewDef({imageSrc: $(event.currentTarget).attr("src")});
      this.$el.append(this.mainImagezoomerModal.render().$el);
      this.mainImagezoomerModal.showModal();
    },


    destroyCurrentImageZoomer: function() {
      if (this.currentImageZoomer) {
        this.currentImageZoomer.destroy();
      }
    },


    addQuantity: function(event) {
      var that = this;
      $(event.currentTarget).blur();
      cartHelper.addItemQuantity(that.id, function() {
        that.refreshCartOperation();
      });
    },


    subtractQuantity: function(event) {
      var that = this;
      $(event.currentTarget).blur();
      cartHelper.subtractItemQuantity(that.id, function() {
        that.refreshCartOperation();
      });
    },


    removeItem: function(event) {
      var that = this;
      $(event.currentTarget).blur();
      cartHelper.removeItem(that.id, function() {
        that.refreshCartOperation();
      });
    },


    startShopping: function() {
      this.destroyCurrentModal();
      this.userSigninModal = new userModalsigninViewDef({closable: true, showZipCodeForm: true});
      this.$el.append(this.userSigninModal.render().$el);
      this.userSigninModal.showModal();
    },


    // to prevent memory leak
    destroyCurrentModal: function() {
      if (this.mainImagezoomerModal) {
        this.mainImagezoomerModal.remove();
      }

      if (this.userSigninModal) {
        this.userSigninModal.remove();
      }
    },


    remove: function() {
      this.destroyCurrentModal();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return detailedinfoitemShowView;
});
