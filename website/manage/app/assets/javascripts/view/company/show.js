modulejs.define("view/company/show", [
  "logger",
  "backbone",
  "jst",
  "app/cached_request",
  "app/utility",
  "app/navigator",
  "app/error_handler",
  "model/company"
], function(logger, Backbone, JST, cachedRequest, utility, navigator, errorHandler, companyModel) {
  "use strict";


  var companyShowView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id;
    },


    mainT: JST["template/company/show"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchModel(companyModel, this.id, {
        success: function(fetchedModel) {
          that.$el.html(that.mainT({company: fetchedModel, pathToUrlTool: utility.pathToUrl, navigator: navigator}));
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/company/show] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    }
  });


  return companyShowView;
});