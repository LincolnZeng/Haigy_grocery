modulejs.define("view/store/select", [
  "alerter",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/cached_request",
  "app/navigator",
  "app/cookie",
  "app/utility",
  "app/error_handler",
  "model/store",
  "collection/store/index"
], function(alerter, logger, Backbone, $, JST, cachedRequest, navigator, cookie, utility, errorHandler, storeModel, storeIndexCollection) {
  "use strict";


  var storeSelectView = Backbone.View.extend({
    initialize: function(options) {
      this.redirectUrlHash = options.redirectUrlHash;
    },


    mainT: JST["template/store/select"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(this.loadingT());

      var currentSelectedStoreId = cookie.getSelectedStoreId();

      cachedRequest.fetchCollection(storeIndexCollection, {}, {
        success: function(fetchedCollection) {
          if (currentSelectedStoreId) {
            cachedRequest.fetchModel(storeModel, currentSelectedStoreId, {
              success: function(fetchedStore) {
                that.$el.html(that.mainT({
                  currentSelectedStore: fetchedStore,
                  allStores: fetchedCollection,
                  pathToUrlTool: utility.pathToUrl,
                  navigator: navigator
                }));
              },

              error: function(collection, jqXHR) {
                logger(jqXHR);
                errorHandler(jqXHR.responseJSON.error_code, ["[view/store/select] - ", jqXHR.responseJSON.error_message].join(""));
              }
            });
          } else {
            that.$el.html(that.mainT({
              currentSelectedStore: null,
              allStores: fetchedCollection,
              navigator: navigator
            }));
          }
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/store/select] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });


      return that;
    },


    events: {
      "click #store-select-submit": "onSubmit"
    },


    onSubmit: function() {
      var selectedStoreId = this.$el.find("#store-select-id").val();
      cookie.setSelectedStoreId(selectedStoreId);

      alerter("Going To Change Selected Store ~");

      if (this.redirectUrlHash === "self") {
        navigator.visit(navigator.storeSelectHash("self"));
      } else {
        navigator.visit(this.redirectUrlHash);
      }
    }
  });


  return storeSelectView;
});
