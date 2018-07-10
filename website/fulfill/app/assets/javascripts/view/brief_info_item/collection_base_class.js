modulejs.define("view/brief_info_item/collection_base_class", [
  "logger",
  "jquery",
  "backbone",
  "jst",
  "app/constant",
  "app/precompiled_asset",
  "app/navigator",
  "app/utility",
  "helper/cart"
], function(logger, $, Backbone, JST, constant, precompiledAsset, navigator,
  utility, cartHelper
) {
  "use strict";


  var briefinfoitemCollectionbaseclassView = Backbone.View.extend({
    // if "multipleLoadMode" is enable, should override two functions:
    // 1. loadMoreHelper(successCallBack(newFetchedItems))
    // 2. hasMoreToLoad(newFetchedItems)
    multipleLoadMode: false,
    loadMoreButtonText: "Click to View More",


    mainT: JST["template/brief_info_item/collection_base_class"],
    loadingT: JST["template/main/loading"],
    itemCartOperationT: JST["template/brief_info_item/_item_cart_operation"],
    itemDisplayT: JST["template/brief_info_item/_item_display"],
    categoryPathT: JST["template/main/_category_path"],


    showLoadMoreButton: function() {
      this.$("#biitem-cbc-special-request").hide();
      this.$("#biitem-cbc-show-more-button-container").show();
    },


    hideLoadMoreButton: function() {
      this.$("#biitem-cbc-special-request").show();
      this.$("#biitem-cbc-show-more-button-container").hide();
    },


    renderHelper: function(fetchedItems, showLoadMoreButton) {
      this.$el.html(this.mainT({
        allItem: fetchedItems,
        loadMoreButtonText: this.loadMoreButtonText,
        itemCartOperationT: this.itemCartOperationT,
        categoryPathT: this.categoryPathT,
        itemDisplayT: this.itemDisplayT,
        imagePathToUrlTool: utility.imagePathToUrl,
        constant: constant,
        precompiledAsset: precompiledAsset,
        navigator: navigator,
        cartHelper: cartHelper
      }));

      if (showLoadMoreButton && this.multipleLoadMode && this.hasMoreToLoad(fetchedItems)) {
        this.showLoadMoreButton();
      } else {
        this.hideLoadMoreButton();
      }

      this.resetPopup();
    },


    resetPopup: function() {
      var allPopups = this.$(".info.circle.icon.link");
      allPopups.popup("destroy");   // prevent memory leak
      allPopups.popup({
        inline: true,
        variation: "very wide"
      });
    },


    events: {
      "click .biitem-cbc-addtocart": "addToCart",
      "click .biitem-cbc-removefromcart": "removeFromCart",
      "click #biitem-cbc-show-more-button": "loadMore"
    },


    addToCart: function(event) {
      var button = $(event.currentTarget);
      var that = this;

      var itemId = button.data("itemId");
      cartHelper.addItemQuantity(itemId, function() {
        var itemCartOperationContainer = that.$([".biitem-cbc-item-extra-content-", itemId].join(""));
        itemCartOperationContainer.empty();
        itemCartOperationContainer.append(that.itemCartOperationT({
          itemId: itemId,
          itemUnit: button.data("itemUnit"),
          cartHelper: cartHelper,
          constant: constant
        }));
      });
    },


    removeFromCart: function(event) {
      var button = $(event.currentTarget);
      var that = this;

      var itemId = button.data("itemId");
      cartHelper.subtractItemQuantity(itemId, true, function() {
        var itemCartOperationContainer = that.$([".biitem-cbc-item-extra-content-", itemId].join(""));
        itemCartOperationContainer.empty();
        itemCartOperationContainer.append(that.itemCartOperationT({
          itemId: itemId,
          itemUnit: button.data("itemUnit"),
          cartHelper: cartHelper,
          constant: constant
        }));
      });
    },


    // if multipleLoadMode is enabled
    // override this method as: hasMoreToLoad(newFetchedItems)
    hasMoreToLoad: function() {
      return false;
    },


    // if multipleLoadMode is enabled
    // override this method as: loadMoreHelper(successCallBack(newFetchedItems))
    loadMoreHelper: function(successCallBack) {
      if (successCallBack) {
        successCallBack({models: []});
      }
    },


    loadMore: function(event) {
      event.preventDefault();
      var loadMoreButton = $(event.currentTarget);
      loadMoreButton.blur();
      loadMoreButton.addClass("loading");

      var that = this;

      that.loadMoreHelper(function(newFetchedItems) {
        if (!that.hasMoreToLoad(newFetchedItems)) {
          that.hideLoadMoreButton();
        }

        that.$("#biitem-cbc-all-item-container").append(that.itemDisplayT({
          allItem: newFetchedItems.models,
          itemCartOperationT: that.itemCartOperationT,
          imagePathToUrlTool: utility.imagePathToUrl,
          constant: constant,
          precompiledAsset: precompiledAsset,
          navigator: navigator,
          cartHelper: cartHelper
        }));

        that.resetPopup();

        that.$("#biitem-cbc-show-more-button").removeClass("loading");
      });
    },


    remove: function() {
      this.$(".info.circle.icon.link").popup("destroy");
      Backbone.View.prototype.remove.call(this);
    }
  });


  return briefinfoitemCollectionbaseclassView;
});
