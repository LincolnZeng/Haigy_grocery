modulejs.define("view/brief_info_item/search", [
  "logger",
  "app/constant",
  "app/cookie",
  "app/error_handler",
  "app/cached_request",
  "view/brief_info_item/collection_base_class",
  "collection/brief_info_item/search"
], function(logger, constant, cookie, errorHandler, cachedRequest,
  briefinfoitemCollectionbaseclassViewDef, briefinfoitemSearchCollection
) {
  "use strict";


  var briefinfoitemSearchView = briefinfoitemCollectionbaseclassViewDef.extend({
    initialize: function(options) {
      this.keyword = options.keyword;
      this.page = 1;
      this.itemCountPerLoad = constant.item.SEARCH_COUNT_PER_PAGE;
      this.nextPageLoadResults = null;
    },


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      var zipCode = cookie.user.getZipCode();

      cachedRequest.fetchCollection(briefinfoitemSearchCollection, {
        keyword: that.keyword,
        page: that.page,
        zipCode: zipCode
      }, {
        success: function(fetchedItems) {
          that.renderHelper(fetchedItems, false);
          var itemCollection = fetchedItems;
          while (that.hasMoreToLoad(itemCollection)) {
            that.nextPageLoadResults = cachedRequest.getCachedCollection(briefinfoitemSearchCollection, {
              keyword: that.keyword,
              page: that.page + 1,
              zipCode: zipCode
            });
            itemCollection = that.nextPageLoadResults;
            if (itemCollection) {
              that.loadMore();
            } else {
              that.showLoadMoreButton();
              break;   // exit the "while" loop
            }
          }
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(["[view/brief_info_item/search] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    hasMoreToLoad: function(newFetchedCollection) {
      return newFetchedCollection.hasMoreToLoad;
    },


    loadMoreHelper: function(successCallBack) {
      var that = this;
      var zipCode = cookie.user.getZipCode();
      that.page += 1;

      if (that.nextPageLoadResults) {
        successCallBack(that.nextPageLoadResults);
      } else {
        cachedRequest.fetchCollection(briefinfoitemSearchCollection, {
          keyword: that.keyword,
          page: that.page,
          zipCode: zipCode
        }, {
          success: function(fetchedItems) {
            successCallBack(fetchedItems);
          },

          error: function(collection, jqXHR) {
            logger(jqXHR);
            errorHandler(["[view/brief_info_item/search] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }
    }
  });


  return briefinfoitemSearchView;
});
