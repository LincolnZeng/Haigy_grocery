modulejs.define("view/user/modal_all_address", [
  "confirmer",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/cached_request",
  "app/cookie",
  "app/error_handler",
  "model/user_address",
  "collection/user_address/index"
], function(
  confirmer, logger, Backbone, $, JST, constant, cachedRequest, cookie,
  errorHandler, useraddressModel, useraddressIndexCollection
) {
  "use strict";


  var userModalselectaddressView = Backbone.View.extend({
    initialize: function(options) {
      this.enableZipCodeChange = (options.enableZipCodeChange === true);
      this.renderContentOnModalVisiable = false;
      this.userId = options.userId;
      this.easyFirstAddressMode = (options.easyFirstAddressMode === true);
      this.zipCodeChangeCallback = options.zipCodeChangeCallback;
      this.selectAddressCallback = options.selectAddressCallback;
      this.newAddressCallback = options.newAddressCallback;
      this.editAddressCallback = options.editAddressCallback;
      this.deleteAddressCallback = options.deleteAddressCallback;
    },


    tagName: "div",
    className: "ui small modal",


    mainT: JST["template/user/modal_all_address/main"],
    contentT: JST["template/user/modal_all_address/content"],
    loadingT: JST["template/user/modal_all_address/loading"],


    render: function() {
      this.$el.html(this.mainT());
      if (!this.userId || useraddressIndexCollection.hasCollectionCache(this.userId)) {
        this.renderContent();
        this.renderContentOnModalVisiable = false;
      } else {
        this.renderLoading(false);
        this.renderContentOnModalVisiable = true;
      }
      return this;
    },


    renderLoading: function(refreshModal) {
      var contentContainer = this.$el.find("#user-m-alladdress-content");
      contentContainer.empty();
      contentContainer.append(this.loadingT());
      if (refreshModal) {
        this.$el.modal("refresh");
      }
    },


    renderContent: function() {
      var that = this;

      if (that.userId) {
        cachedRequest.fetchCollection(useraddressIndexCollection, {userId: that.userId}, {
          success: function(fetchedUserAddressCollection) {
            if (that.easyFirstAddressMode && fetchedUserAddressCollection.length === 0) {
              if (that.newAddressCallback) {
                that.newAddressCallback(that.easyFirstAddressMode);
              }
            } else {
              that.renderContentHelper(fetchedUserAddressCollection);
            }
            that.easyFirstAddressMode = false;
          },

          error: function(collection, jqXHR) {
            logger(jqXHR);
            errorHandler(["[view/user/modal_all_address] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      } else {
        that.renderContentHelper(null);
      }
    },


    renderContentHelper: function(userAddressCollection) {
      var contentContainer = this.$("#user-m-alladdress-content");
      contentContainer.empty();
      contentContainer.append(this.contentT({
        userId: this.userId,
        enableZipCodeChange: this.enableZipCodeChange,
        cartZipCode: (cookie.user.getZipCode() || "").toString(),
        addressCollection: userAddressCollection
      }));
      this.$el.modal("refresh");
      this.$(".user-m-alladdress-info").popup();
      if (this.enableZipCodeChange) {
        this.zipCodeForm = this.$("#user-m-alladdress-zip-code-form");
        this.initializeZipCodeForm(this.zipCodeForm);
      }
    },


    initializeZipCodeForm: function(zipCodeChangeForm) {
      var that = this;

      zipCodeChangeForm.form({
        fields: {
          zip_code: constant.semanticUi.validateRule.ZIP_CODE
        },

        onSuccess: function(event) {
          if (event) {
            event.preventDefault();
          }

          var submitButton = that.$("#user-m-alladdress-zip-code-submit");
          submitButton.prop("disabled", true);
          submitButton.addClass("loading disabled");

          var newZipCode = zipCodeChangeForm.form("get values").zip_code;

          if (that.zipCodeChangeCallback) {
            that.zipCodeChangeCallback(newZipCode);
          }

          return false;
        }
      });
    },


    showModal: function() {
      var that = this;

      if (!that.$("#user-m-alladdress-content").is(':empty')) {
        that.$el.modal({
          detachable: false,
          autofocus: false,
          allowMultiple: false,
          dimmerSettings: {
            opacity: constant.semanticUi.dimmer.OPACITY
          },
          onVisible: function() {
            if (that.renderContentOnModalVisiable) {
              that.renderContent();
              that.renderContentOnModalVisiable = false;
            }
          }
        });
        that.$el.modal("show");
      }
    },


    hideModal: function() {
      this.$el.modal("hide");
    },


    events: {
      "click .user-m-alladdress-address": "selectAddress",
      "click #user-m-alladdress-add": "newAddress",
      "click .user-m-alladdress-edit": "editAddress",
      "click .user-m-alladdress-delete": "deleteAddress",
      "click .user-m-alladdress-info": "preventSelectAddress"
    },


    selectAddress: function(event) {
      event.preventDefault();
      var selectedAddress = $(event.currentTarget);
      selectedAddress.blur();

      if (selectedAddress.data("zipCode").toString() !== (cookie.user.getZipCode() || "").toString()) {
        if (confirmer("Please double check your shopping cart after selecting this address, because some items may be no longer available.")) {
          if (this.selectAddressCallback) {
            this.selectAddressCallback(selectedAddress.data("id"));
          }
        }
      } else {
        if (this.selectAddressCallback) {
          this.selectAddressCallback(selectedAddress.data("id"));
        }
      }
    },


    newAddress: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      if (this.newAddressCallback) {
        this.newAddressCallback();
      }
    },


    editAddress: function(event) {
      event.preventDefault();
      event.stopPropagation();
      var editButton = $(event.currentTarget);
      editButton.blur();

      if (this.editAddressCallback) {
        this.editAddressCallback(editButton.data("id"));
      }
    },


    deleteAddress: function(event) {
      event.preventDefault();
      event.stopPropagation();
      var deleteButton = $(event.currentTarget);
      deleteButton.blur();

      if (confirmer("Are you sure to remove the address?")) {
        var that = this;

        deleteButton.prop("disabled", true);
        that.renderLoading(true);

        cachedRequest.destroyModel(useraddressModel, deleteButton.data("id"), {
          success: function(deletedUserAddress) {
            that.renderContent();
            if (that.deleteAddressCallback) {
              that.deleteAddressCallback(deletedUserAddress);
            }
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(["[view/user/modal_all_address] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }
    },


    preventSelectAddress: function(event) {
      event.preventDefault();
      event.stopPropagation();
      $(event.currentTarget).blur();
    },


    remove: function() {
      this.hideModal();
      this.$(".user-m-alladdress-info").popup("destroy");
      if (this.zipCodeForm) {
        this.zipCodeForm.form("destroy");
      }
      this.$el.modal("destroy");
      this.$el.empty();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return userModalselectaddressView;
});
