modulejs.define("view/user/modal_edit_base_class", [
  "alerter",
  "logger",
  "backbone",
  "jst",
  "app/cookie",
  "app/constant",
  "app/navigator",
  "app/cached_request",
  "app/error_handler",
  "model/user"
], function(alerter, logger, Backbone, JST, cookie, constant, navigator, cachedRequest, errorHandler, userModel) {
  "use strict";


  var userModaleditbaseclassView = Backbone.View.extend({
    initialize: function(options) {
      this.userId = options.userId.toString();
      this.updateSuccessCallback = options.updateSuccessCallback;
      this.editForm = null;
    },


    tagName: "div",
    className: "ui small modal",


    // methods should be implemented by the inherited class
    template: function() {},
    templateParameters: function(userAttributes) {return {};},
    formFieldsSetting: function() {return {};},
    generateUserAttributes: function(formData) {return {};},


    render: function() {
      var token = cookie.tokenHandler.getToken();

      if (token && token !== constant.session.GUEST_TOKEN) {
        var user = cookie.user.getSession().user;
        if (this.userId === user.id.toString()) {
          this.$el.html(this.template(this.templateParameters(user)));
          this.editForm = this.$("#user-m-edit-form");
          this.initializeEditForm(this.editForm);
        } else {
          navigator.mainHome({replace: true});
        }
      } else {
        navigator.mainHome({replace: true});
      }

      return this;
    },


    initializeEditForm: function(editForm) {
      var that = this;

      editForm.form({
        fields: that.formFieldsSetting(),

        onSuccess: function(event) {
          if (event) {
            event.preventDefault();
          }

          var submitButton = that.$("#user-m-edit-submit");
          var cancelButton = that.$("#user-m-edit-cancel");
          submitButton.prop("disabled", true);
          cancelButton.prop("disabled", true);
          editForm.addClass("loading");
          submitButton.addClass("loading disabled");
          cancelButton.addClass("disabled");

          var formData = editForm.form("get values");
          var userAttributes = that.generateUserAttributes(formData);

          cachedRequest.saveModel(userModel, userAttributes, {
            success: function(updatedUser) {
              that.hideModal();
              if (that.updateSuccessCallback) {
                that.updateSuccessCallback(updatedUser);
              }
            },

            error: function(model, jqXHR) {
              if (jqXHR && jqXHR.responseJSON) {
                logger(jqXHR);
                var errorCode = jqXHR.responseJSON.error_code;

                switch(errorCode) {
                  case constant.errorCode.INVALID_EMAIL:
                    alerter("Sorry, the email address is invalid.");
                    break;
                  case constant.errorCode.EMAIL_REGISTERED:
                    alerter("Sorry, the email address has been registered.");
                    break;
                  case constant.errorCode.AUTHENTICATION_FAILED:
                    alerter("Sorry, the password is not correct.");
                    break;
                  default:
                    that.hideModal();
                    logger(jqXHR);
                    errorHandler(["[view/user/modal_edit_base_class] - ", jqXHR.responseJSON.error_message].join(""));
                    return;
                }

                submitButton.prop("disabled", false);
                cancelButton.prop("disabled", false);
                editForm.removeClass("loading");
                submitButton.removeClass("loading disabled");
                cancelButton.removeClass("disabled");
              } else {
                that.hideModal();
                var otherError = "[view/user/sign_up] - other error, may be caused by an invalid JSON response.";
                logger(otherError);
                errorHandler(otherError);
              }
            }
          });
          return false;
        }
      });
    },


    showModal: function() {
      var that = this;

      that.$el.modal({
        closable: true,
        detachable: false,
        allowMultiple: false,
        dimmerSettings: {
          opacity: constant.semanticUi.dimmer.OPACITY
        },

        onApprove: function() {
          that.editForm.form("validate form");
          return false;
        },

        onDeny: function() {
          return true;
        }
      });
      that.$el.modal("show");
    },


    hideModal: function() {
      this.$el.modal("hide");
    },


    remove: function() {
      this.hideModal();
      if (this.editForm) {
        this.editForm.form("destroy");
      }
      this.$el.modal("destroy");
      this.$el.empty();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return userModaleditbaseclassView;
});
