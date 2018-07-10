modulejs.define("view/session/sign_in", [
  "alerter",
  "logger",
  "backbone",
  "jst",
  "app/cached_request",
  "app/cookie",
  "app/navigator",
  "app/error_handler",
  "model/session"
], function(alerter, logger, Backbone, JST, cachedRequest, cookie, navigator, errorHandler, sessionModel) {
  "use strict";


  var sessionSigninView = Backbone.View.extend({
    className: "ui container",


    template: JST["template/session/sign_in"],


    render: function() {
      this.$el.html(this.template());
      this.signInForm = this.$el.find("#session-signin-form");
      this.initializeSignInForm(this.signInForm);

      return this;
    },


    initializeSignInForm: function(signInForm) {
      signInForm.form({
        fields: {
          email: "email",
          password: ["minLength[8]"]
        },

        onSuccess: function(event) {
          event.preventDefault();
          var submitButton = signInForm.find("#session-signin-submit-button");
          submitButton.prop("disabled", true);
          submitButton.addClass("loading disabled");

          var signInFormData = signInForm.form("get values");

          cachedRequest.saveModel(sessionModel, signInFormData, {
            success: function(createdSession) {
              cookie.setSession(createdSession.attributes);
              navigator.refresh();
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              alerter(jqXHR.responseJSON.error_message);
              submitButton.prop("disabled", false);
              submitButton.removeClass("loading disabled");
            }
          });

          return false;
        }
      });
    },


    remove: function() {
      if (this.signInForm) {
        this.signInForm.form("destroy");
      }
      Backbone.View.prototype.remove.call(this);
    }
  });


  return sessionSigninView;
});
