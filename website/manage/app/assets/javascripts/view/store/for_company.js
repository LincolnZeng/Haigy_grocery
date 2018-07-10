modulejs.define("view/store/for_company", [
  "logger",
  "backbone",
  "jst",
  "app/cached_request",
  "app/utility",
  "app/navigator",
  "app/error_handler",
  "model/company",
  "collection/store/for_company"
], function(logger, Backbone, JST, cachedRequest, utility, navigator, errorHandler, companyModel, storeForcompanyCollection) {
  "use strict";


  var storeForcompanyView = Backbone.View.extend({
    initialize: function(options) {
      this.companyId = options.companyId;
    },


    mainT: JST["template/store/for_company"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchModel(companyModel, this.companyId, {
        success: function(fetchedCompany) {

          cachedRequest.fetchCollection(storeForcompanyCollection, {companyId: that.companyId}, {
            success: function(fetchedStores) {
              that.$el.html(that.mainT({company: fetchedCompany, allStore: fetchedStores, pathToUrlTool: utility.pathToUrl, navigator: navigator}));
            },

            error: function(collection, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/store/for_company] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });

        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/store/for_company] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return this;
    }
  });


  return storeForcompanyView;
});
