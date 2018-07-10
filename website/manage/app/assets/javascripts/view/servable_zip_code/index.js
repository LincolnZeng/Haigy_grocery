modulejs.define("view/servable_zip_code/index", [
  "alerter",
  "confirmer",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/navigator",
  "app/cached_request",
  "app/error_handler",
  "model/servable_zip_code",
  "collection/service_area/index",
  "collection/servable_zip_code/index"
], function(alerter, confirmer, logger, Backbone, $, JST, constant, navigator, cachedRequest, errorHandler,
  servablezipcodeModel, serviceareaIndexCollection, servablezipcodeIndexCollection
) {
  "use strict";


  var servablezipcodeIndexView = Backbone.View.extend({
    mainT: JST["template/servable_zip_code/index"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchCollection(serviceareaIndexCollection, {}, {
        success: function(fetchedServiceAreaCollection) {
          cachedRequest.fetchCollection(servablezipcodeIndexCollection, {}, {
            success: function(fetchedServableZipCodeCollection) {
              that.$el.html(that.mainT({
                allZipCodes: fetchedServableZipCodeCollection,
                allServiceAreas: fetchedServiceAreaCollection
              }));

              var validateRule = constant.semanticUi.validateRule;

              that.$(".szc-index-zipcode-edit-form").form({
                fields: {
                  zip_code: validateRule.ZIP_CODE,
                  city: validateRule.EMPTY,
                  state: validateRule.EMPTY
                },

                onSuccess: function(event) {
                  event.preventDefault();
                  var form = $(event.currentTarget);
                  form.addClass("loading");
                  var zipCodeData = form.form("get values");
                  cachedRequest.saveModel(servablezipcodeModel, zipCodeData, {
                    success: function() {
                      navigator.refresh();
                    },

                    error: function(model, jqXHR) {
                      logger(jqXHR);
                      errorHandler(jqXHR.responseJSON.error_code, ["[view/servable_zip_code/index] - ", jqXHR.responseJSON.error_message].join(""));
                    }
                  });

                  return false;
                }
              });
            },

            error: function(collection, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/servable_zip_code/index] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/servable_zip_code/index] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    events: {
      "click .szc-index-zipcode-edit": "showZipCodeEditForm",
      "click .szc-index-zipcode-edit-form-cancel": "hideZipCodeEditForm",
      "click #szc-index-new-zipcode": "showNewZipCodeForm",
      "click #szc-index-new-zipcode-form-cancel": "hideNewZipCodeForm",
      "click .szc-index-zipcode-delete": "deleteZipCode"
    },


    showZipCodeEditForm: function(event) {
      event.preventDefault();
      var element = $(event.currentTarget);
      element.blur();
      var zipCodeId = element.data("zipCodeId");
      this.$(["#szc-index-zipcode-", zipCodeId, "-show-container"].join("")).hide();
      this.$(["#szc-index-zipcode-", zipCodeId, "-edit-container"].join("")).show();
    },


    hideZipCodeEditForm: function(event) {
      event.preventDefault();
      var element = $(event.currentTarget);
      element.blur();
      var zipCodeId = element.data("zipCodeId");
      this.$(["#szc-index-zipcode-", zipCodeId, "-edit-container"].join("")).hide();
      this.$(["#szc-index-zipcode-", zipCodeId, "-show-container"].join("")).show();
    },


    showNewZipCodeForm: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();
      $("#szc-index-new-zipcode-form-container").show();
    },


    hideNewZipCodeForm: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();
      $("#szc-index-new-zipcode-form-container").hide();
    },


    deleteZipCode: function(event) {
      event.preventDefault();

      var that = this;
      confirmer("Are you sure?", function() {
        var element = $(event.currentTarget);
        element.blur();
        var zipCodeId = element.data("zipCodeId");
        that.$(["#szc-index-zipcode-", zipCodeId, "-edit-form"].join("")).addClass("loading");

        cachedRequest.destroyModel(servablezipcodeModel, zipCodeId, {
          success: function() {
            navigator.refresh();
          },

          error: function(model, jqXHR) {
            if (jqXHR.responseJSON.error_code === constant.errorCode.NOT_ALLOWED) {
              alerter(jqXHR.responseJSON.error_message);
              navigator.refresh();
            } else {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/servable_zip_code/index] - ", jqXHR.responseJSON.error_message].join(""));
            }
          }
        });
      }).open();
    },


    remove: function() {
      this.$(".szc-index-zipcode-edit-form").form("destroy");
      Backbone.View.prototype.remove.call(this);
    }
  });


  return servablezipcodeIndexView;
});
