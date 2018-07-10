modulejs.define("view/order/index", [
  "logger",
  "backbone",
  "jst",
  "jquery",
  "app/constant",
  "app/utility",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "collection/order/index"
], function(logger, Backbone, JST, $, constant, utility, cachedRequest, navigator, errorHandler, orderIndexCollection) {
  "use strict";


  var orderIndexView = Backbone.View.extend({
    mainT: JST["template/order/index"],
    loadingT: JST["template/main/loading"],


    render: function() {

      var that = this;

      that.$el.html(that.loadingT());


      cachedRequest.fetchCollection(orderIndexCollection, {}, {
        success: function(fetchedCollection) {
          that.$el.html(that.mainT({allOrder: fetchedCollection, pathToUrlTool: utility.pathToUrl, navigator: navigator, utility: utility}));
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/order/index] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });


      return that;
    }

  });
  return orderIndexView;
});
