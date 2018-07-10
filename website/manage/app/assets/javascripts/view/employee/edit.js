modulejs.define("view/employee/edit", [
  "confirmer",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "lib/easy_form",
  "app/cached_request",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "model/employee"
], function(confirmer, logger, Backbone, $, JST, easyForm, cachedRequest, constant, navigator, errorHandler, employeeModel) {
  "use strict";


  var employeeEditView = Backbone.View.extend({
    initialize: function(options) {
      var that = this;

      if (options) {
        that.id = options.id;
      } else {
        that.id = null;
      }

      that.formHelper = new easyForm({
        validator: {
          repeatPassword: function() {
            var passwordInput = that.$el.find("#employee-edit-password");
            if (passwordInput.val() === that.$el.find("#employee-edit-repeat-password").val()) {
              passwordInput.data("valid", null);   // reset validation result
              return true;
            } else {
              return false;
            }
          }
        }
      });
    },


    mainT: JST["template/employee/edit"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      if (that.id) {   // edit an employee profile
        that.$el.html(that.loadingT());

        cachedRequest.fetchModel(employeeModel, that.id, {
          success: function(fetchedModel) {
            that.$el.html(that.mainT({employeeNew: false, employee: fetchedModel, constant: constant}));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/employee/edit] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      } else {
        var newEmployee = new employeeModel();
        that.$el.html(that.mainT({employeeNew: true, employee: newEmployee, constant: constant}));
      }

      return that;
    },


    events: {
      "input #employee-edit-first-name,#employee-edit-middle-name,#employee-edit-last-name,#employee-edit-email,#employee-edit-password,#employee-edit-repeat-password,#employee-edit-current-password": "onInput",
      "blur #employee-edit-first-name,#employee-edit-last-name,#employee-edit-email,#employee-edit-password,#employee-edit-repeat-password,#employee-edit-current-password": "onInput",
      "change #employee-edit-position": "onInput",
      "keyup #employee-edit-first-name,#employee-edit-middle-name,#employee-edit-last-name,#employee-edit-email,#employee-edit-password,#employee-edit-repeat-password,#employee-edit-current-password": "onKeyUp",
      "click #employee-edit-submit": "onSubmit",
      "click #employee-edit-delete": "onDelete"
    },


    onInput: function(event) {
      this.formHelper.onTextInput(event);
      this.formHelper.refreshSubmit(this.$el.find("#employee-edit-submit"));
    },


    onKeyUp: function(event) {
      if (this.formHelper.isEnterKey(event)) {
        this.$el.find("#employee-edit-submit").trigger("click");
      }
    },


    onSubmit: function(event) {
      var submitButton = $(event.currentTarget);
      if (this.formHelper.isSubmittable(submitButton, true)) {
        // prevent multiple triggering
        submitButton.html("Submitting ...");
        this.formHelper.disableSubmit(submitButton);

        var thisEl = this.$el;

        var employeeAttributes = {
          first_name: thisEl.find("#employee-edit-first-name").val().trim(),
          middle_name: thisEl.find("#employee-edit-middle-name").val().trim(),
          last_name: thisEl.find("#employee-edit-last-name").val().trim(),
          email: thisEl.find("#employee-edit-email").val().trim(),
          job_position_id: thisEl.find("#employee-edit-position").val()
        };

        var password = thisEl.find("#employee-edit-password").val();
        if (this.id) {
          employeeAttributes.id = this.id;
          if (password.length > 0) {
            employeeAttributes.password = password;
          }
          employeeAttributes.current_password = thisEl.find("#employee-edit-current-password").val();
        } else {
          employeeAttributes.password = password;
        }

        cachedRequest.saveModel(employeeModel, employeeAttributes, {
          success: function(savedModel) {
            navigator.employeeShow(savedModel.id);
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
      confirmer("Are you sure to delete this account?", function() {
        cachedRequest.destroyModel(employeeModel, that.id, {
          success: function() {
            navigator.employeeIndex();
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/employee/edit] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }).open();
    }
  });


  return employeeEditView;
});
