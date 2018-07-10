modulejs.define("view/user/modal_edit_address", [
  "alerter",
  "confirmer",
  "logger",
  "backbone",
  "jst",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "app/cached_request",
  "app/cache",
  "model/user_address"
], function(
  alerter, confirmer, logger, Backbone, JST, constant, navigator,
  errorHandler, cachedRequest, cache, userAddressModel
) {
  "use strict";


  var userModaladdressformView = Backbone.View.extend({
    initialize: function(options) {
      if (!options) {
        options = {};
      }

      this.id = options.id;   // user address id
      this.userId = options.userId;
      this.denyCallback = options.denyCallback;
      this.hideCallback = options.hideCallback;
      this.moreSubmitAttributes = options.moreSubmitAttributes;
      this.submitSuccessCallback = options.submitSuccessCallback;
      this.submitErrorCallback = options.submitErrorCallback;
      this.zipCode = options.zipCode;
      this.zipCodeChangeUrl = options.zipCodeChangeUrl;
      this.zipCodeChangeWarningMessage = options.zipCodeChangeWarningMessage;

      this.addressFormData = cache.userModaleditaddressData.get();
      this.guestUser = false;
      this.onlyValidateAddress = false;   // if "onlyValidateAddress === true", only validate the address instead of saving the address.
      this.hideModalAfterSubmitSuccess = true;
      this.hideModalAfterSubmitError = true;
      this.submitted = false;

      if (options.guestUser === true) {
        this.guestUser = true;
      }

      if (options.onlyValidateAddress === true) {
        this.onlyValidateAddress = true;
      }

      if (options.addressFormData) {
        this.addressFormData = options.addressFormData;
      }

      if (options.hideModalAfterSubmitSuccess === false) {
        this.hideModalAfterSubmitSuccess = false;
      }

      if (options.hideModalAfterSubmitError === false) {
        this.hideModalAfterSubmitError = false;
      }
    },


    tagName: "div",
    className: "ui small modal",


    template: JST["template/user/modal_edit_address"],


    render: function() {
      var that = this;

      that.$el.html(that.template({
        guestUser: that.guestUser,
        zipCode: that.zipCode,
        zipCodeChangeUrl: that.zipCodeChangeUrl,
        navigator: navigator
      }));
      that.addressForm = that.$("#user-m-editaddress-form");
      that.initializeAddressForm(that.addressForm);
      if (that.addressFormData) {
        that.addressForm.form("set values", that.addressFormData);
      }
      that.switchAddressType();

      that.$(".user-m-editaddress-type").checkbox({
        onChange: function() {
          that.switchAddressType();
        }
      });

      return that;
    },


    // fetch user address model from database and then render
    fetchAndRender: function() {
      var that = this;

      that.$el.html(that.template({
        guestUser: that.guestUser,
        zipCode: that.zipCode,
        zipCodeChangeUrl: that.zipCodeChangeUrl,
        navigator: navigator
      }));

      that.addressForm = that.$("#user-m-editaddress-form");
      that.addressForm.addClass("loading");

      var formSubmitButton = that.$("#user-m-editaddress-form-submit");
      formSubmitButton.prop("disabled", true);
      formSubmitButton.addClass("disabled");

      var cancelButton = that.$("#user-m-editaddress-cancel");
      cancelButton.prop("disabled", true);
      cancelButton.addClass("disabled");

      cachedRequest.fetchModel(userAddressModel, that.id, {
        success: function(fetchedAddress) {
          that.initializeAddressForm(that.addressForm);

          var addressFormData = fetchedAddress.attributes;
          if (addressFormData.is_business_address) {
            addressFormData.address_type = "business";
          }
          that.addressForm.form("set values", addressFormData);
          that.switchAddressType();

          that.$(".user-m-editaddress-type").checkbox({
            onChange: function() {
              that.switchAddressType();
            }
          });

          that.addressForm.removeClass("loading");
          formSubmitButton.prop("disabled", false);
          formSubmitButton.removeClass("disabled");
          cancelButton.prop("disabled", false);
          cancelButton.removeClass("disabled");
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(["[view/user/modal_edit_address] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    switchAddressType: function() {
      var businessNameInput = this.$("#user-m-editaddress-business-name");
      if (this.addressForm.form("get value", "address_type") === "business") {
        businessNameInput.show();
      } else {
        businessNameInput.hide();
      }
    },


    initializeAddressForm: function(addressForm) {
      var that = this;

      var validateRule = constant.semanticUi.validateRule;

      addressForm.form({
        fields: {
          input_street_address: validateRule.STREET_ADDRESS,
          input_zip_code: validateRule.ZIP_CODE
        },

        onSuccess: function(event) {
          if (event) {
            event.preventDefault();
          }

          var submitButton = that.$("#user-m-editaddress-form-submit");
          var cancelButton = that.$("#user-m-editaddress-cancel");
          submitButton.prop("disabled", true);
          cancelButton.prop("disabled", true);
          addressForm.addClass("loading");
          submitButton.addClass("loading disabled");
          cancelButton.addClass("disabled");

          var addressFormData = addressForm.form("get values");
          if (addressFormData.address_type === "business") {
            addressFormData.is_business_address = true;
          } else {
            addressFormData.is_business_address = false;
            delete addressFormData.business_name;
          }

          if (that.id) {
            addressFormData.id = that.id;
          }

          if (that.userId) {
            addressFormData.user_id = that.userId;
          }

          if (that.onlyValidateAddress) {
            addressFormData.only_validate = true;
          }

          if (that.zipCode) {
            addressFormData.input_zip_code = that.zipCode;
          }

          var moreAttributes = that.moreSubmitAttributes;
          if (moreAttributes) {
            for (var key in moreAttributes) {
              addressFormData[key] = moreAttributes[key];
            }
          }

          cachedRequest.saveModel(userAddressModel, addressFormData, {
            success: function(savedUserAddress) {
              that.submitted = true;

              if (that.hideModalAfterSubmitSuccess) {
                that.hideModal();
              }

              if (that.submitSuccessCallback) {
                that.submitSuccessCallback(savedUserAddress);
              }
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              alerter(jqXHR.responseJSON.error_message);
              submitButton.prop("disabled", false);
              cancelButton.prop("disabled", false);
              addressForm.removeClass("loading");
              submitButton.removeClass("loading disabled");
              cancelButton.removeClass("disabled");

              if (that.hideModalAfterSubmitError) {
                that.hideModal();
              }

              if (that.submitErrorCallback) {
                that.submitErrorCallback(jqXHR);
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
        detachable: false,
        allowMultiple: false,
        dimmerSettings: {
          opacity: constant.semanticUi.dimmer.OPACITY
        },

        onApprove: function() {
          that.addressForm.form("validate form");
          return false;
        },

        onDeny: function() {
          if (that.denyCallback) {
            return that.denyCallback();
          } else {
            return true;
          }
        },

        onHide: function() {
          var formData = {};

          if (that.submitted) {
            cache.userModaleditaddressData.clear();
          } else {
            formData = that.addressForm.form("get values");
            cache.userModaleditaddressData.set(formData);
          }

          if (that.hideCallback) {
            that.hideCallback(formData);
          }
        }
      });
      that.$el.modal("show");
    },


    hideModal: function() {
      this.$el.modal("hide");
    },


    events: {
      "click #user-m-editaddress-change-zip-code": "changeZipCode"
    },


    changeZipCode: function(event) {
      event.preventDefault();
      if (this.zipCodeChangeUrl) {
        var warningMessage = this.zipCodeChangeWarningMessage;
        if (warningMessage) {
          if (confirmer(warningMessage)) {
            this.hideModal();
            navigator.visit(this.zipCodeChangeUrl);
          }
        } else {
          this.hideModal();
          navigator.visit(this.zipCodeChangeUrl);
        }
      } else {
        this.hideModal();
      }
    },


    remove: function() {
      this.hideModal();
      this.$el.find(".user-m-editaddress-type").checkbox("destroy");
      if (this.addressForm) {
        this.addressForm.form("destroy");
      }
      this.$el.modal("destroy");
      this.$el.empty();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return userModaladdressformView;
});
