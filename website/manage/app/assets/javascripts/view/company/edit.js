modulejs.define("view/company/edit", [
  "confirmer",
  "formdata",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "lib/easy_form",
  "app/cached_request",
  "app/utility",
  "app/navigator",
  "app/error_handler",
  "model/company"
], function(confirmer, FormData, logger, Backbone, $, JST, easyForm, cachedRequest, utility, navigator, errorHandler, companyModel) {
  "use strict";


  var companyEditView = Backbone.View.extend({
    initialize: function(options) {
      if (options) {
        this.id = options.id;
      } else {
        this.id = null;
      }

      this.formHelper = new easyForm();
    },


    mainT: JST["template/company/edit/main"],
    afterDeleteT: JST["template/company/edit/after_delete"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      if (that.id) {   // edit a company
        that.$el.html(that.loadingT());

        cachedRequest.fetchModel(companyModel, that.id, {
          success: function(fetchedModel) {
            that.$el.html(that.mainT({companyNew: false, company: fetchedModel, pathToUrlTool: utility.pathToUrl}));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/company/edit] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      } else {   // create a new company
        var newCompany = new companyModel();
        that.$el.html(that.mainT({companyNew: true, company: newCompany}));
      }

      return that;
    },


    events: {
      "input #company-edit-name": "onInput",
      "change #company-edit-logo": "onInput",
      "blur #company-edit-name": "onInput",
      "keyup #company-edit-name": "onKeyUp",
      "click #company-edit-submit": "onSubmit",
      "click #company-edit-delete": "onDelete"
    },


    onInput: function(event) {
      this.formHelper.onTextInput(event);
      this.formHelper.refreshSubmit(this.$el.find("#company-edit-submit"));
    },


    onKeyUp: function(event) {
      if (this.formHelper.isEnterKey(event)) {
        this.$el.find("#company-edit-submit").trigger("click");
      }
    },


    onSubmit: function(event) {
      var submitButton = $(event.currentTarget);
      if (this.formHelper.isSubmittable(submitButton, true)) {
        // prevent multiple triggering
        submitButton.html("Submitting ...");
        this.formHelper.disableSubmit(submitButton);

        var formData = new FormData();

        formData.append("company[name]", this.$el.find("#company-edit-name").val().trim());
        var image = this.$el.find("#company-edit-logo").get(0).files[0];
        if (image) {
          formData.append("company[logo]", image);
        }

        cachedRequest.saveModelByMultipart(companyModel, this.id, formData, {
          success: function(savedModel) {
            navigator.companyShow(savedModel.id);
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/company/edit] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }
    },


    onDelete: function(event) {
      event.preventDefault();

      var that = this;
      confirmer("Are you sure to delete this company?", function() {
        cachedRequest.destroyModel(companyModel, that.id, {
          success: function(destroyedModel) {
            that.$el.html(that.afterDeleteT({company: destroyedModel}));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/company/edit] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }).open();
    }
  });


  return companyEditView;
});