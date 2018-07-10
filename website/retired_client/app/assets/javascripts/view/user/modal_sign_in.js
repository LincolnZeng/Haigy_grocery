modulejs.define("view/user/modal_sign_in", [
  "alerter",
  "logger",
  "backbone",
  "jst",
  "app/constant",
  "app/navigator",
  "app/cookie",
  "app/cached_request",
  "app/error_handler",
  "helper/session",
  "model/session",
  "collection/user_address/change_zip_code"
], function(
  alerter, logger, Backbone, JST, constant, navigator, cookie, cachedRequest,
  errorHandler, sessionHelper, sessionModel, useraddressChangezipcodeCollection
) {
  "use strict";


  var modalUserConfirm = Backbone.View.extend({
    initialize: function(options) {
      this.closable = (options.closable === true);
      this.showSignUp = (options.showSignUp === true);
      this.showZipCodeForm = (options.showZipCodeForm === true);
      this.redirectUrlHash = options.redirectUrlHash || null;
      this.redirect = false;
    },


    tagName: "div",
    className: "ui small modal",


    template: JST["template/user/modal_sign_in"],


    render: function() {
      this.$el.html(this.template({
        closable: this.closable,
        showSignUp: this.showSignUp,
        showZipCodeForm: this.showZipCodeForm,
        navigator: navigator
      }));
      this.signInForm = this.$el.find("#user-m-confirm-signin-form");
      this.zipCodeForm = this.$el.find("#user-m-confirm-zip-code-form");

      this.initializeSignInForm(this.signInForm);
      this.initializeZipCodeForm(this.zipCodeForm);

      return this;
    },


    initializeSignInForm: function(signInForm) {
      var that = this;

      var validateRule = constant.semanticUi.validateRule;

      signInForm.form({
        fields: {
          email: validateRule.EMAIL,
          password: validateRule.PASSWORD
        },

        onSuccess: function(event) {
          event.preventDefault();
          var submitButton = signInForm.find("#user-m-confirm-signin-submit");
          submitButton.prop("disabled", true);
          submitButton.addClass("loading disabled");

          var signInFormData = signInForm.form("get values");
          signInFormData.email = (signInFormData.email || "").trim();

          cachedRequest.saveModel(sessionModel, signInFormData, {
            success: function(createdSession) {
              cookie.clearAllCookieExceptToken();
              if (sessionHelper.setSession(createdSession.attributes)) {
                that.redirect = true;
                that.hideModal();
              } else {
                var errorMessage = "Sign in failed. Invalid server response.";
                logger(errorMessage);
                errorHandler(["[view/user/modal_sign_in] - ", errorMessage].join(""));
                that.hideModal();
              }
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


    initializeZipCodeForm: function(zipCodeForm) {
      var that = this;

      zipCodeForm.form({
        fields: {
          zip_code: constant.semanticUi.validateRule.ZIP_CODE,
        },

        onSuccess: function(event) {
          event.preventDefault();
          var submitButton = zipCodeForm.find("#user-m-confirm-start-shop");
          submitButton.prop("disabled", true);
          submitButton.addClass("loading disabled");
          var zipCode = (zipCodeForm.form("get values").zip_code || "").trim();

          cachedRequest.fetchCollection(useraddressChangezipcodeCollection, {}, {
            type: "POST",

            data: {
              old_zip_code: "",
              new_zip_code: zipCode
            },

            success: function(fetchedCollection) {
              cookie.initializeCookie(constant.session.GUEST_TOKEN, fetchedCollection.getServiceAreaId(), zipCode);
              if (!cookie.user.isServableArea()) {
                alerter(constant.text.NO_SERVICE_WARNING);
              }
              that.redirect = true;
              that.hideModal();
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              errorHandler(["[view/user/modal_sign_in] - ", jqXHR.responseJSON.error_message].join(""));
            }
          }, true);

          return false;
        }
      });
    },


    showModal: function() {
      var that = this;

      that.$el.modal({
        detachable: false,
        closable: that.closable,
        dimmerSettings: {
          opacity: constant.semanticUi.dimmer.OPACITY
        },
        onHidden: function() {
          if (that.redirectUrlHash) {
            navigator.tmp();
            navigator.visit(that.redirectUrlHash, {replace: true});
          } else {
            if (that.redirect) {
              navigator.refresh({replace: true});
            }
          }
        }
      });
      that.$el.modal("show");
    },


    hideModal: function() {
      this.$el.modal("hide");
    },


    events: {
      "click #user-m-confirm-sign-up": "onSignUp"
    },


    onSignUp: function(event) {
      event.preventDefault();
      this.hideModal();
      var redirectUrl = navigator.current();
      if (this.redirectUrlHash) {
        redirectUrl = this.redirectUrlHash;
      }
      navigator.userSignup(JSON.stringify({redirectUrl: redirectUrl, cancelUrl: redirectUrl}));
    },


    remove: function() {
      this.hideModal();
      if (this.signInForm) {
        this.signInForm.form("destroy");
      }
      if (this.zipCodeForm) {
        this.zipCodeForm.form("destroy");
      }
      this.$el.modal("destroy");
      this.$el.empty();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return modalUserConfirm;
});