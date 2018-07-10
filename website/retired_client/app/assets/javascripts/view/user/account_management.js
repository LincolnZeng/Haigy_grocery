modulejs.define("view/user/account_management", [
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/cookie",
  "app/navigator",
  "app/error_handler",
  "helper/session",
  "helper/select_user_address",
  "view/user/modal_edit_email",
  "view/user/modal_edit_password",
  "view/user/modal_edit_phone",
  "view/user/modal_edit_nickname",
  "view/main/modal_busy"
], function(
  logger, Backbone, $, JST, constant, cookie, navigator, errorHandler, sessionHelper,
  selectuseraddressHelper, userModaleditemailViewDef, userModaleditpasswordViewDef,
  userModaleditphoneViewDef, userModaleditnicknameViewDef, mainModalbusyViewDef
) {
  "use strict";


  var userAccountmanageView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id.toString();
      this.addressHelper = null;
      this.currentModal = null;
    },


    mainT: JST["template/user/account_management/main"],
    addressT: JST["template/user/account_management/_address"],


    render: function() {
      var that = this;

      var token = cookie.tokenHandler.getToken();

      if (token && token !== constant.session.GUEST_TOKEN) {
        var user = cookie.user.getSession().user;

        if (that.id === user.id.toString()) {
          that.$el.html(that.mainT({
            user: user,
            navigator: navigator
          }));

          that.refreshAddress();

          that.addressHelper = new selectuseraddressHelper({
            userId: user.id,
            view: that,
            addressChangeCallback: function() {
              that.refreshAddress();
            }
          });
        } else {
          navigator.mainHome({replace: true});
        }
      } else {
        navigator.mainHome({replace: true});
      }

      return that;
    },


    refreshAddress: function() {
      var zipCode = cookie.user.getZipCode();
      var address = cookie.user.getAddress();
      var addressContainer = this.$("#user-am-address-container");
      var color = addressContainer.data("color");
      addressContainer.empty();
      addressContainer.append(this.addressT({zipCode: zipCode, address: address, color: color}));
    },


    events: {
      "click #user-am-edit-email": "editEmail",
      "click #user-am-edit-password": "editPassword",
      "click #user-am-edit-phone": "editPhone",
      "click #user-am-edit-nickname": "editNickname",
      "click #user-am-manage-address": "manageAddress",
      "click #user-am-sign-out": "signOut"
    },


    startEditModal: function(event, modalViewDef) {
      event.preventDefault();
      $(event.currentTarget).blur();

      var that = this;
      that.destroyCurrentModal();
      that.currentModal = new modalViewDef({
        userId: that.id,
        updateSuccessCallback: function(updatedUser) {
          if (sessionHelper.updateSession(null, updatedUser.attributes)) {
            navigator.refresh();
          } else {
            var errorMessage = "Fail to update the session.";
            logger(errorMessage);
            errorHandler(errorMessage);
          }
        }
      });
      that.$el.append(that.currentModal.render().$el);
      that.currentModal.showModal();
    },



    editEmail: function(event) {
      this.startEditModal(event, userModaleditemailViewDef);
    },


    editPassword: function(event) {
      this.startEditModal(event, userModaleditpasswordViewDef);
    },


    editPhone: function(event) {
      this.startEditModal(event, userModaleditphoneViewDef);
    },


    editNickname: function(event) {
      this.startEditModal(event, userModaleditnicknameViewDef);
    },


    manageAddress: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      if (this.addressHelper) {
        this.addressHelper.start();
      }
    },


    signOut: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      this.destroyCurrentModal();
      this.currentModal = new mainModalbusyViewDef({
        header: "Sign out ...",
        onVisibleCallback: function() {
          sessionHelper.signOut();
        }
      });
      this.$el.append(this.currentModal.render().$el);
      this.currentModal.showModal();
    },


    // to prevent memory leak
    destroyCurrentModal: function() {
      if (this.currentModal) {
        this.currentModal.remove();
      }
    },


    remove: function() {
      this.destroyCurrentModal();
      if (this.addressHelper) {
        this.addressHelper.removeAllModals();
      }
      Backbone.View.prototype.remove.call(this);
    }
  });


  return userAccountmanageView;
});
