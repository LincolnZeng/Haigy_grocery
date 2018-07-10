modulejs.define("view/store/index", [
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/cached_request",
  "app/utility",
  "app/navigator",
  "app/error_handler",
  "collection/store/index"
], function(logger, Backbone, $, JST, cachedRequest, utility, navigator, errorHandler, storeIndexCollection) {
  "use strict";


  var storeIndexView = Backbone.View.extend({
    mainT: JST["template/store/index"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchCollection(storeIndexCollection, {}, {
        success: function(fetchedCollection) {
          that.$el.html(that.mainT({allStore: fetchedCollection, pathToUrlTool: utility.pathToUrl, navigator: navigator}));
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/store/index] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    }
  });


  return storeIndexView;
});