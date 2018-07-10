modulejs.define("view/item/uncategorized", [
  "logger",
  "backbone",
  "jst",
  "app/cached_request",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "app/utility",
  "model/item",
  "collection/item/manage"
], function(logger, Backbone, JST, cachedRequest, constant, navigator, errorHandler, utility, itemModel, itemManageCollection) {
  "use strict";


  var itemUncategorizedView = Backbone.View.extend({
    mainT: JST["template/item/uncategorized"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchCollection(itemManageCollection, {parentCategoryItemId: constant.item.DEFAULT_PARENT_CATEGORY_ITEM_ID}, {
        success: function(fetchedItems) {
          that.$el.html(that.mainT({
            allUncategorizedItem: fetchedItems,
            rootCategoryId: constant.item.ROOT_PARENT_CATEGORY_ITEM_ID,
            pathToUrlTool: utility.pathToUrl,
            navigator: navigator
          }));
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/item/uncategorized] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    }
  });


  return itemUncategorizedView;
});
