modulejs.define("view/user/recover_password", [
  "alerter",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "app/cached_request",
  "collection/user/recover_password"
], function(alerter, logger, Backbone, $, JST, constant, navigator, errorHandler,
  cachedRequest, userRecoverpasswordCollection
) {
  "use strict";


  var userRecoverpasswordView = Backbone.View.extend({
    template: JST["template/user/recover_password"],


    render: function() {
      this.$el.html(this.template());
      this.recoverPasswordForm = this.$("#user-recoverpassword-form");
      this.initializeRecoverPasswordForm(this.recoverPasswordForm);
      return this;
    },


    initializeRecoverPasswordForm: function(recoverPasswordForm) {
      var that = this;

      recoverPasswordForm.form({
        fields: {
          email: constant.semanticUi.validateRule.EMAIL
        },

        onSuccess: function(event) {
          event.preventDefault();
          var form = $(event.currentTarget);
          form.addClass("loading");

          var email = form.form("get values").email.trim();

          cachedRequest.fetchCollection(userRecoverpasswordCollection, {}, {
            type: "POST",

            data: {
              email: email.toLowerCase()
            },

            success: function(responsedRecoverpasswordCollection) {
              that.$("#user-recoverpassword-form-container").hide();
              var successMessageContainer = that.$("#user-recoverpassword-success-message-container");
              successMessageContainer.html(["<div>A temporary password has been sent to your email address:</div><div>",
                email,
                "</div><br><div>You may sign in with this temporary password within next ",
                responsedRecoverpasswordCollection.getTemporaryPasswordLifetimeInMinutes(),
                " minutes, and reset your password through the Account Management page.</div>"
              ].join(""));
              successMessageContainer.show();
              navigator.mainHome({trigger: false});
            },

            error: function(model, jqXHR) {
              if (jqXHR && jqXHR.responseJSON) {
                if (jqXHR.responseJSON.error_code === constant.errorCode.RECORD_NOT_FOUND) {
                  alerter(jqXHR.responseJSON.error_message);
                  form.removeClass("loading");
                } else {
                  logger(jqXHR);
                  errorHandler(["[view/user/recover_password] - ", jqXHR.responseJSON.error_message].join(""));
                }
              } else {
                var otherError = "[view/user/recover_password] - other error, may be caused by an invalid JSON response.";
                logger(otherError);
                errorHandler(otherError);
              }
            }
          });
          return false;
        }
      });
    },


    events: {
      "click #user-recoverpassword-cancel": "onCancel"
    },


    onCancel: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();
      navigator.mainHome();
    },


    remove: function() {
      if (this.recoverPasswordForm) {
        this.recoverPasswordForm.form("destroy");
      }
      Backbone.View.prototype.remove.call(this);
    }
  });


  return userRecoverpasswordView;
});
