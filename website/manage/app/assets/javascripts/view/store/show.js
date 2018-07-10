modulejs.define("view/store/show", [
  "logger",
  "backbone",
  "jst",
  "app/cached_request",
  "app/navigator",
  "app/utility",
  "app/error_handler",
  "model/store",
  "collection/service_area/index"
], function(logger, Backbone, JST, cachedRequest, navigator, utility,
  errorHandler, storeModel, serviceareaIndexCollection
) {
  "use strict";


  var storeShowView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id;
    },


    mainT: JST["template/store/show"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchCollection(serviceareaIndexCollection, {}, {
        success: function(fetchedServiceAreaCollection) {
          cachedRequest.fetchModel(storeModel, that.id, {
            success: function(fetchedModel) {
              that.$el.html(that.mainT({
                store: fetchedModel,
                allServiceAreas: fetchedServiceAreaCollection,
                pathToUrlTool: utility.pathToUrl,
                navigator: navigator
              }));
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/store/show] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/store/show] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    }
  });


  return storeShowView;
});