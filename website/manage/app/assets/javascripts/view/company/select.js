modulejs.define("view/company/select", [
  "logger",
  "backbone",
  "jst",
  "app/cached_request",
  "app/error_handler",
  "app/navigator",
  "collection/company/index"
], function(logger, Backbone, JST, cachedRequest, errorHandler, navigator, companyIndexCollection) {
  "use strict";


  var companySelectView = Backbone.View.extend({
    mainT: JST["template/company/select"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchCollection(companyIndexCollection, {}, {
        success: function(fetchedCollection) {
          that.$el.html(that.mainT({allCompany: fetchedCollection, navigator: navigator}));
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/company/select] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    events: {
      "click #company-select-submit": "onSubmit"
    },


    onSubmit: function() {
      navigator.companyShow(this.$el.find("#company-select-id").val());
    }
  });


  return companySelectView;
});