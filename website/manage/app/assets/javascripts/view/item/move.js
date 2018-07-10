modulejs.define("view/item/move", [
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "app/utility",
  "model/item",
  "collection/item/manage"
], function(logger, Backbone, $, JST, cachedRequest, navigator, errorHandler, utility, itemModel, itemManageCollection) {
  "use strict";


  var itemMoveView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id;
      this.parentId = options.parentCategoryItemId;
    },


    mainT: JST["template/item/move"],
    loadingT: JST["template/main/loading"],
    categoryPathT: JST["template/item/_category_path"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchModel(itemModel, that.id, {
        success: function(fetchedItem) {
          cachedRequest.fetchCollection(itemManageCollection, {parentCategoryItemId: that.parentId}, {
            success: function(fetchedItemsInCategory) {
              that.$el.html(that.mainT({
                item: fetchedItem,
                allItemInCategory: fetchedItemsInCategory,
                parentCategoryItemId: that.parentId,
                categoryPathTemplate: that.categoryPathT,
                pathToUrlTool: utility.pathToUrl,
                navigator: navigator
              }));
            },

            error: function(collection, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/item/move] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/item/move] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    events: {
      "click .item-move-to-category": "onMove"
    },


    onMove: function(event) {
      var that = this;

      var moveButton = $(event.currentTarget);
      var moveToCategoryId = moveButton.data("toCategoryId");
      moveButton.html("Moving ...");
      that.$el.find(".item-move-to-category").prop("disabled", true);

      cachedRequest.saveModel(itemModel, {id: that.id, parent_category_item_id: moveToCategoryId}, {
        success: function() {
          navigator.itemManage(that.parentId);
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/item/move] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });
    }
  });


  return itemMoveView;
});
