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


    mainFaqHash: "#faq",
    mainFaq: function(options) {
      backboneNavigate(this.mainFaqHash, options);
    },


    mainContactusHash: "#contactUs",
    mainContactus: function(options) {
      backboneNavigate(this.mainContactusHash, options);
    },


    mainHowhaigyworksHash: "#howHaigyWorks",
    mainHowhaigyworks: function(options) {
      backboneNavigate(this.mainHowhaigyworksHash, options);
    },


    mainCustomizedorderformHash: "#customizedOrderForm",
    mainCustomizedorderform: function(options) {
      backboneNavigate(this.mainCustomizedorderformHash, options);
    },


    mainComingsoonHash: "#comingSoon",
    mainComingsoon: function(options) {
      backboneNavigate(this.mainComingsoonHash, options);
    },


    detailedinfoitemShowHash: function(id) {
      return ["#detailedInfoItem/", encodeURIComponent(id), "/show"].join("");
    },
    detailedinfoitemShow: function(id, options) {
      backboneNavigate(this.detailedinfoitemShowHash(id), options);
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


    briefinfoitemSubstitueHash: function(id) {
      return ["#briefInfoItem/", encodeURIComponent(id), "/substitue"].join("");
    },
    briefinfoitemSubstitue: function(id, options) {
      backboneNavigate(this.briefinfoitemSubstitueHash(id), options);
    },


    cartManageHash: "#carts/manage",
    cartManage: function(options) {
      backboneNavigate(this.cartManageHash, options);
    },


    cartShowHash: function(id) {
      return ["#cart/", encodeURIComponent(id)].join("");
    },
    cartShow: function(id, options) {
      backboneNavigate(this.cartShowHash(id), options);
    },


    userAccountmanagementHash: "#users/accountManagement",
    userAccountmanagement: function(options) {
      backboneNavigate(this.userAccountmanagementHash, options);
    },


    userRecoverpasswordHash: "#users/recoverPassword",
    userRecoverpassword: function(options) {
      backboneNavigate(this.userRecoverpasswordHash, options);
    },


    orderCheckoutHash: "#orders/checkout",
    orderCheckout: function(options) {
      backboneNavigate(this.orderCheckoutHash, options);
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


    orderPlacedreminderHash: function(id) {
      return ["#order/", encodeURIComponent(id), "/placed_reminder"].join("");
    },
    orderPlacedreminder: function(id, options) {
      backboneNavigate(this.orderPlacedreminderHash(id), options);
    },


    mainUnknownHash: "#*unknown",
    mainUnknown: function(options) {
      backboneNavigate(this.mainUnknownHash, options);
    },

  };


  return navigator;
});
