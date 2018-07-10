modulejs.define("view/employee/show", [
  "logger",
  "backbone",
  "jst",
  "app/cached_request",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "model/employee"
], function(logger, Backbone, JST, cachedRequest, constant, navigator, errorHandler, employeeModel) {
  "use strict";


  var employeeShowView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id;
    },


    mainT: JST["template/employee/show"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchModel(employeeModel, that.id, {
        success: function(fetchedModel) {
          that.$el.html(that.mainT({employee: fetchedModel, constant: constant, navigator: navigator}));
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/employee/show] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    }
  });


  return employeeShowView;
});
