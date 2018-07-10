modulejs.define("view/user/sign_up", [
  "alerter",
  "logger",
  "backbone",
  "jst",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "app/cookie",
  "app/cached_request",
  "app/analytics",
  "helper/cart",
  "helper/session",
  "model/user"
], function(
  alerter, logger, Backbone, JST, constant, navigator, errorHandler,
  cookie, cachedRequest, analytics, cartHelper, sessionHelper, userModel
) {
  "use strict";


  var userSignupView = Backbone.View.extend({
    initialize: function(options) {
      this.redirectUrl = null;
      this.cancelUrl = null;

      if (options) {
        if (options.jsonParams.length < constant.MAX_URL_LENGTH) {
          var params = {};
          try {
            params = JSON.parse(decodeURIComponent(options.jsonParams));
          } catch (error) {
            logger(error);
          }
          if (params.redirectUrl) {
            this.redirectUrl = params.redirectUrl;
          }
          if (params.cancelUrl) {
            this.cancelUrl = params.cancelUrl;
          }
        } else {
          var errorMessage = "[view/item/search] - URL is too long.";
          logger(errorMessage);
          errorHandler(errorMessage);
        }
      }
    },


    template: JST["template/user/sign_up"],


    render: function() {
      var zipCode = cookie.user.getZipCode();
      this.$el.html(this.template({zipCode: zipCode, redirectUrl: this.redirectUrl}));
      this.signUpForm = this.$("#user-signup-form");
      this.initializeSignUpForm(this.signUpForm);
      this.$(".checkbox").checkbox();

      return this;
    },


    initializeSignUpForm: function(signUpForm) {
      var that = this;

      var validateRule = constant.semanticUi.validateRule;
      signUpForm.form({
        fields: {
          email: validateRule.EMAIL,
          password: validateRule.PASSWORD,
          repeat_password: {rules: [{type: "match[password]", prompt: "The repeated password does not match the password."}]},
          zip_code: validateRule.ZIP_CODE
        },

        onSuccess: function(event) {
          event.preventDefault();
          var submitButton = signUpForm.find("#user-signup-submit");
          submitButton.prop("disabled", true);
          submitButton.addClass("loading disabled");

          var signUpFormData = signUpForm.form("get values");
          var cartData = cartHelper.getServerRequiredCartInfo(false, true);
          if (cartData && cartData.length === 0) {
            cartData = null;
          }

          var zipCode = signUpFormData.zip_code || cookie.user.getZipCode();

          var userData = {
            zip_code: zipCode,
            email: signUpFormData.email.trim(),
            password: signUpFormData.password,
            repeat_password: signUpFormData.repeat_password,
            subscribe_news: !!signUpFormData.subscribe_news,
            cart: cartData,
            special_requests: cartHelper.getSpecialRequestsInJsonFormat()
          };

          cachedRequest.saveModel(userModel, userData, {
            success: function(createdUser) {
              if (sessionHelper.setSession(createdUser.get("session"))) {
                if (that.redirectUrl) {
                  navigator.visit(that.redirectUrl);
                } else {
                  navigator.mainHome();
                }
              } else {
                var errorMessage = "Sign in failed. Invalid server response.";
                logger(errorMessage);
                errorHandler(["[view/user/sign_up] - ", errorMessage].join(""));
              }
            },

            error: function(model, jqXHR) {
              if (jqXHR && jqXHR.responseJSON) {
                var errorCode = jqXHR.responseJSON.error_code;

                switch(errorCode) {
                  case constant.errorCode.INVALID_EMAIL:
                    alerter("Sorry, the email address is invalid.");
                    break;
                  case constant.errorCode.EMAIL_REGISTERED:
                    alerter("Sorry, the email address has been registered.");
                    break;
                  case constant.errorCode.INVALID_PASSWORD:
                    alerter("Sorry, the password is invalid.");
                    break;
                  default:
                    logger(jqXHR);
                    errorHandler(["[view/user/sign_up] - ", jqXHR.responseJSON.error_message].join(""));
                    return;
                }

                submitButton.prop("disabled", false);
                submitButton.removeClass("loading disabled");
              } else {
                var otherError = "[view/user/sign_up] - other error, may be caused by an invalid JSON response.";
                logger(otherError);
                errorHandler(otherError);
              }
            }
          });

          analytics.signUp();

          return false;
        }
      });
    },


    events: {
      "click #user-signup-cancel": "onCancel"
    },


    onCancel: function(event) {
      event.preventDefault();

      if (this.cancelUrl) {
        navigator.visit(this.cancelUrl);
      } else {
        navigator.mainHome();
      }
    },


    remove: function() {
      this.$(".checkbox").checkbox("destroy");
      if (this.signUpForm) {
        this.signUpForm.form("destroy");
      }
      Backbone.View.prototype.remove.call(this);
    }
  });


  return userSignupView;
});
