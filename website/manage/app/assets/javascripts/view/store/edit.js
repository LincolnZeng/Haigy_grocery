modulejs.define("view/store/edit", [
  "confirmer",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "lib/easy_form",
  "app/cached_request",
  "app/error_handler",
  "app/navigator",
  "app/utility",
  "model/store",
  "model/company",
  "collection/service_area/index"
], function(confirmer, logger, Backbone, $, JST, easyForm, cachedRequest,
  errorHandler, navigator, utility, storeModel, companyModel, serviceareaIndexCollection
) {
  "use strict";


  var storeNewView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id || null;
      this.companyId = options.companyId;

      this.formHelper = new easyForm();
    },


    mainT: JST["template/store/edit/main"],
    afterDeleteT: JST["template/store/edit/after_delete"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchCollection(serviceareaIndexCollection, {}, {
        success: function(fetchedServiceAreaCollection) {
          if (that.id) {   // edit a store
            cachedRequest.fetchModel(storeModel, that.id, {
              success: function(fetchedStore) {
                that.$el.html(that.mainT({
                  storeNew: false,
                  store: fetchedStore,
                  allServiceAreas: fetchedServiceAreaCollection,
                  pathToUrlTool: utility.pathToUrl
                }));
              },

              error: function(model, jqXHR) {
                logger(jqXHR);
                errorHandler(jqXHR.responseJSON.error_code, ["[view/store/edit] - ", jqXHR.responseJSON.error_message].join(""));
              }
            });
          } else {   // create a new store
            var store = new storeModel();

            cachedRequest.fetchModel(companyModel, that.companyId, {
              success: function(fetchedCompany) {
                that.$el.html(that.mainT({
                  storeNew: true,
                  company: fetchedCompany,
                  store: store,
                  allServiceAreas: fetchedServiceAreaCollection,
                  pathToUrlTool: utility.pathToUrl
                }));
              },

              error: function(model, jqXHR) {
                logger(jqXHR);
                errorHandler(jqXHR.responseJSON.error_code, ["[view/store/edit] - ", jqXHR.responseJSON.error_message].join(""));
              }
            });
          }
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/store/edit] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    events: {
      "input #store-edit-store-name,#store-edit-street-address,#store-edit-city,#store-edit-state,#store-edit-zip-code": "onInput",
      "blur #store-edit-store-name,#store-edit-street-address,#store-edit-zip-code": "onInput",
      "keyup #store-edit-store-name,#store-edit-street-address,#store-edit-city,#store-edit-state,#store-edit-zip-code": "onKeyUp",
      "change #store-edit-service-area": "onInput",
      "click #store-edit-submit": "onSubmit",
      "click #store-edit-delete": "onDelete"
    },


    onRadioSelect: function(event) {
      this.formHelper.onRadioSelect(event);
      this.formHelper.refreshSubmit(this.$el.find("#store-edit-submit"));
    },


    onInput: function(event) {
      this.formHelper.onTextInput(event);
      this.formHelper.refreshSubmit(this.$el.find("#store-edit-submit"));
    },


    onKeyUp: function(event) {
      if (this.formHelper.isEnterKey(event)) {
        this.$el.find("#store-edit-submit").trigger("click");
      }
    },


    onSubmit: function(event) {
      var submitButton = $(event.currentTarget);
      if (this.formHelper.isSubmittable(submitButton, true)) {
        // prevent multiple triggering
        submitButton.html("Submitting ...");
        this.formHelper.disableSubmit(submitButton);

        var inputAddress = [
          this.$("#store-edit-street-address").val().trim(), ", ",
          this.$("#store-edit-city").val().trim(), ", ",
          this.$("#store-edit-state").val().trim(), " ",
          this.$("#store-edit-zip-code").val().trim()
        ].join("");

        var storeAttributes = {
          service_area_id: this.$("#store-edit-service-area").val(),
          store_name: this.$("#store-edit-store-name").val().trim().toLowerCase(),
          input_address: inputAddress
        };

        if (this.id) {
          storeAttributes.id = this.id;
        } else {
          storeAttributes.company_id = this.companyId;
        }

        cachedRequest.saveModel(storeModel, storeAttributes, {
          success: function(savedModel) {
            navigator.storeShow(savedModel.id);
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/store/new] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }
    },


    onDelete: function(event) {
      event.preventDefault();

      var that = this;
      confirmer("Are you sure to delete this store?", function() {
        cachedRequest.destroyModel(storeModel, that.id, {
          success: function(destroyedModel) {
            that.$el.html(that.afterDeleteT({store: destroyedModel, pathToUrlTool: utility.pathToUrl}));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/store/edit] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }).open();
    }
  });


  return storeNewView;
});