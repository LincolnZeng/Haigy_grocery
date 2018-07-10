modulejs.define("view/employee/index", [
  "logger",
  "backbone",
  "jst",
  "app/cached_request",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "collection/employee/index"
], function(logger, Backbone, JST, cachedRequest, constant, navigator, errorHandler, employeeIndexCollection) {
  "use strict";


  var employeeIndexView = Backbone.View.extend({
    mainT: JST["template/employee/index"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchCollection(employeeIndexCollection, {}, {
        success: function(fetchedCollection) {
          that.$el.html(that.mainT({allEmployee: fetchedCollection, constant: constant, navigator: navigator}));
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/employee/index] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    }
  });


  return employeeIndexView;
});
