modulejs.define("view/item/manage", [
  "logger",
  "backbone",
  "jst",
  "app/constant",
  "app/cookie",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "app/utility",
  "model/item",
  "collection/item/manage"
], function(logger, Backbone, JST, constant, cookie, cachedRequest, navigator, errorHandler, utility, itemModel, itemManageCollection) {
  "use strict";


  var itemManageView = Backbone.View.extend({
    initialize: function(options) {
      this.parentId = options.parentCategoryItemId;
    },


    mainT: JST["template/item/manage"],
    loadingT: JST["template/main/loading"],
    categoryPathT: JST["template/item/_category_path"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchCollection(itemManageCollection, {parentCategoryItemId: that.parentId}, {
        success: function(fetchedItems) {
          that.$el.html(that.mainT({
            allItem: fetchedItems,
            selectedStoreId: cookie.getSelectedStoreId(),
            parentCategoryItemId: that.parentId,
            categoryPathTemplate: that.categoryPathT,
            pathToUrlTool: utility.pathToUrl,
            navigator: navigator,
            constant: constant,
            utility: utility
          }));
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/item/manage] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    }
  });


  return itemManageView;
});
