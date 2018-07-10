modulejs.define("view/brief_info_item/browse", [
  "logger",
  "app/constant",
  "app/cookie",
  "app/error_handler",
  "app/cached_request",
  "view/brief_info_item/collection_base_class",
  "collection/brief_info_item/browse"
], function(logger, constant, cookie, errorHandler, cachedRequest,
  briefinfoitemCollectionbaseclassViewDef, briefinfoitemBrowseCollection
) {
  "use strict";


  var briefinfoitemBrowseView = briefinfoitemCollectionbaseclassViewDef.extend({
    initialize: function(options) {
      this.parentId = options.parentCategoryItemId;

      this.load = 1;
      this.multipleLoadMode = true;
      this.loadMoreButtonText = "Click to View All";
      this.cachedSecondLoadResults = null;
    },


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      var zipCode = cookie.user.getZipCode();

      cachedRequest.fetchCollection(briefinfoitemBrowseCollection, {
        parentCategoryItemId: that.parentId,
        zipCode: zipCode,
        load: this.load
      }, {
        success: function(fetchedItems) {
          that.renderHelper(fetchedItems, false);
          if (that.hasMoreToLoad(fetchedItems)) {
            that.cachedSecondLoadResults = cachedRequest.getCachedCollection(briefinfoitemBrowseCollection, {
              parentCategoryItemId: that.parentId,
              zipCode: zipCode,
              load: 2   // second load
            });
            if (that.cachedSecondLoadResults) {
              that.loadMore();
            } else {
              that.showLoadMoreButton();
            }
          }
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(["[view/brief_info_item/browse] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    hasMoreToLoad: function(newFetchedCollection) {
      return newFetchedCollection.hasMoreToLoad;
    },


    loadMoreHelper: function(successCallBack) {
      var that = this;
      that.load += 1;

      if (that.cachedSecondLoadResults) {
        successCallBack(that.cachedSecondLoadResults);
      } else {
        var zipCode = cookie.user.getZipCode();

        cachedRequest.fetchCollection(briefinfoitemBrowseCollection, {
          parentCategoryItemId: that.parentId,
          zipCode: zipCode,
          load: that.load
        }, {
          success: function(fetchedItems) {
            successCallBack(fetchedItems);
          },

          error: function(collection, jqXHR) {
            logger(jqXHR);
            errorHandler(["[view/brief_info_item/browse] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }
    }
  });


  return briefinfoitemBrowseView;
});
