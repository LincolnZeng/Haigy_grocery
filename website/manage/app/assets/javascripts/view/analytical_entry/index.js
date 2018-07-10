modulejs.define("view/analytical_entry/index", [
  "logger",
  "backbone",
  "jst",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "collection/analytical_entry/index"
], function(logger, Backbone, JST, cachedRequest, navigator, errorHandler, analyticalentryIndexCollection) {
  "use strict";


  var analyticalentryIndexView = Backbone.View.extend({
    initialize: function(options) {
      this.from = options.from;
      this.to = options.to;
    },


    mainT: JST["template/analytical_entry/index"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchCollection(analyticalentryIndexCollection, {from: this.from, to: this.to}, {
        success: function(fetchedCollection) {
          that.$el.html(that.mainT({
            allAnalyticalEntries: fetchedCollection,
            from: that.from,
            to: that.to,
            navigator: navigator
          }));
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/analytical_entry/index] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    events: {},


    remove: function() {
      Backbone.View.prototype.remove.call(this);
    }
  });


  return analyticalentryIndexView;
});
