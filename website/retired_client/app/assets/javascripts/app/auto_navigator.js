// This is an auto generated file. Please don't modify it directly. Run "rake haigy_route:generate_navigator" instead to update it.
modulejs.define("app/navigator", ["underscore", "backbone"], function(_, Backbone) {
  "use strict";


  var backboneNavigate = function(urlHash, options) {
    options = _.extend({trigger: true}, options);
    Backbone.history.navigate(urlHash, options);
  };


  var navigator = {
    current: function() {
      var hashFragment = Backbone.history.getFragment();
      if (hashFragment && hashFragment.length > 0) {
        return ["#", hashFragment].join("");
      } else {
        return "#";
      }
    },


    tmp: function() {
      this.visit("#tmp", {trigger: false, replace: true});
    },


    refresh: function() {
      var currentUrlHash = this.current();
      this.tmp();
      this.visit(currentUrlHash, {replace: true});
    },


    visit: function(urlHash, options) {
      backboneNavigate(urlHash, options);
    },


    back: function() {
      Backbone.history.history.back();
    },


    mainHomeHash: "#",
    mainHome: function(options) {
      backboneNavigate(this.mainHomeHash, options);
    },


    mainWelcomeHash: function(zipCode) {
      return ["#main/welcome/", encodeURIComponent(zipCode)].join("");
    },
    mainWelcome: function(zipCode, options) {
      backboneNavigate(this.mainWelcomeHash(zipCode), options);
    },


    mainFaqHash: "#main/faq",
    mainFaq: function(options) {
      backboneNavigate(this.mainFaqHash, options);
    },


    mainErrorHash: function(errorMessage) {
      return ["#main/error/", encodeURIComponent(errorMessage)].join("");
    },
    mainError: function(errorMessage, options) {
      backboneNavigate(this.mainErrorHash(errorMessage), options);
    },


    briefinfoitemBrowseHash: function(parentCategoryItemId) {
      return ["#briefInfoItems/browse/", encodeURIComponent(parentCategoryItemId)].join("");
    },
    briefinfoitemBrowse: function(parentCategoryItemId, options) {
      backboneNavigate(this.briefinfoitemBrowseHash(parentCategoryItemId), options);
    },


    briefinfoitemSearchHash: function(keyword) {
      return ["#briefInfoItems/search/", encodeURIComponent(keyword)].join("");
    },
    briefinfoitemSearch: function(keyword, options) {
      backboneNavigate(this.briefinfoitemSearchHash(keyword), options);
    },


    detailedinfoitemShowHash: function(id) {
      return ["#detailedInfoItem/", encodeURIComponent(id), "/show"].join("");
    },
    detailedinfoitemShow: function(id, options) {
      backboneNavigate(this.detailedinfoitemShowHash(id), options);
    },


    cartManageHash: "#carts/manage",
    cartManage: function(options) {
      backboneNavigate(this.cartManageHash, options);
    },


    cartSpecialrequestHash: function(jsonParams) {
      return ["#carts/specialRequest/", encodeURIComponent(jsonParams)].join("");
    },
    cartSpecialrequest: function(jsonParams, options) {
      backboneNavigate(this.cartSpecialrequestHash(jsonParams), options);
    },


    userSignupHash: function(jsonParams) {
      return ["#users/signUp/", encodeURIComponent(jsonParams)].join("");
    },
    userSignup: function(jsonParams, options) {
      backboneNavigate(this.userSignupHash(jsonParams), options);
    },


    userRecoverpasswordHash: "#users/recoverPassword",
    userRecoverpassword: function(options) {
      backboneNavigate(this.userRecoverpasswordHash, options);
    },


    userAccountmanagementHash: function(id) {
      return ["#user/", encodeURIComponent(id), "/accountManagement"].join("");
    },
    userAccountmanagement: function(id, options) {
      backboneNavigate(this.userAccountmanagementHash(id), options);
    },


    orderUsercheckoutHash: "#orders/userCheckout",
    orderUsercheckout: function(options) {
      backboneNavigate(this.orderUsercheckoutHash, options);
    },


    orderGuestcheckoutHash: "#orders/guestCheckout",
    orderGuestcheckout: function(options) {
      backboneNavigate(this.orderGuestcheckoutHash, options);
    },


    orderReviewHash: "#orders/review",
    orderReview: function(options) {
      backboneNavigate(this.orderReviewHash, options);
    },


    orderIndexHash: "#orders/index",
    orderIndex: function(options) {
      backboneNavigate(this.orderIndexHash, options);
    },


    orderShowHash: function(id) {
      return ["#order/", encodeURIComponent(id), "/show"].join("");
    },
    orderShow: function(id, options) {
      backboneNavigate(this.orderShowHash(id), options);
    },


    mainUnknownHash: "#*unknown",
    mainUnknown: function(options) {
      backboneNavigate(this.mainUnknownHash, options);
    },

  };


  return navigator;
});
