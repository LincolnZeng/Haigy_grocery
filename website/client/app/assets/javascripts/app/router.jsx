modulejs.define("app/router", [
  "backbone",
  "jquery",
  "react",
  "reactdom",
  "confirmer",
  "page_loading_blocker",
  "app/cookie",
  "app/cache",
  "app/constant",
  "app/utility",
  "app/navigator",
  "app/analytics",
  "state/store",
  "state/action",
  "component/layout/main"
], function(Backbone, $, React, ReactDOM, confirmer, pageLoadingBlocker, cookie, cache,
  constant, utility, navigator, analytics, stateStore, stateAction, LayoutMainComponent
){
  "use strict";


  var needRenderLayout = true;
  var currentUrlHash = null;


  var router = Backbone.Router.extend({
    routes: {
      "": "mainHome",
      "faq": "mainFaq",
      "contactUs": "mainContactus",
      "howHaigyWorks": "mainHowhaigyworks",
      "customizedOrderForm": "mainCustomizedorderform",
      "comingSoon": "mainComingsoon",

      "detailedInfoItem/:id/show": "detailedinfoitemShow",

      "briefInfoItems/browse/:parentCategoryItemId": "briefinfoitemBrowse",
      "briefInfoItems/search/:keyword": "briefinfoitemSearch",
      "briefInfoItem/:id/substitue": "briefinfoitemSubstitue",

      "carts/manage": "cartManage",
      "cart/:id": "cartShow",

      "users/accountManagement": "userAccountmanagement",
      "users/recoverPassword": "userRecoverpassword",

      "orders/checkout": "orderCheckout",
      "orders/index": "orderIndex",
      "order/:id/show": "orderShow",
      "order/:id/placed_reminder": "orderPlacedreminder",

      "*unknown": "mainUnknown"
    },


    execute: function(callback, args) {
      var that = this;

      $(function() {
        if (currentUrlHash) {
          // save the scroll position
          var lastScrollPositionData = cache.lastScrollPositionData.get() || {};
          lastScrollPositionData[currentUrlHash] = utility.scrollTopPosition();
          cache.lastScrollPositionData.set(lastScrollPositionData);
          currentUrlHash = null;
        }

        if (needRenderLayout) {
          that.renderLayout();
          needRenderLayout = false;
        }

        callback.apply(that, args);
      });
    },


    renderLayout: function() {
      var reactRootContainer = $("<div></div>");
      var appNoticeContainer = $(["<div id=", constant.APP_LAYOUT_NOTICE_CONTAINER_HTML_ID,"></div>"].join(""));
      var htmlBody = $("body");
      htmlBody.empty();
      htmlBody.append(reactRootContainer);
      htmlBody.append(appNoticeContainer);
      ReactDOM.render(<LayoutMainComponent />, reactRootContainer.get(0));
    },


    recoverScroll: function(currentUrlHash) {
      // recover the last scroll position
      var lastScrollPosition = (cache.lastScrollPositionData.get() || {})[currentUrlHash];
      if (lastScrollPosition) {
        utility.scrollTop(lastScrollPosition);
      } else {
        utility.scrollTop(0);
      }
    },


    render: function(componentModuleName, options, requiredPermissions) {
      var confirmerInstance = confirmer();
      if (confirmerInstance.isOpen()) {
        confirmerInstance.close();
      }
      var pageLoadingBlockerInstance = pageLoadingBlocker();
      if (pageLoadingBlockerInstance.isOpen()) {
        pageLoadingBlockerInstance.close();
      }

      var normalRender = false;
      if (requiredPermissions) {   // TODO: make this easier to use.
        if (requiredPermissions.signedIn === true) {
          if (cookie.user.getUserId()) {
            normalRender = true;
          } else {
            const UserSigninformComponent = modulejs.require("component/user/_sign_in_form");
            stateStore.dispatch(stateAction.renderPage(UserSigninformComponent, {
              formHeader: "Please sign in first"
            }));
          }
        } else if (requiredPermissions.hasDeliverableZipCode === true) {
          if (cookie.user.hasDeliverableZipCode()) {
            normalRender = true;
          } else {
            navigator.mainHome();
          }
        } else {
          normalRender = true;
        }
      } else {
        normalRender = true;
      }

      if (normalRender) {
        const CurrentComponent = modulejs.require(componentModuleName);
        stateStore.dispatch(stateAction.renderPage(CurrentComponent, options));
        currentUrlHash = navigator.current();
        this.recoverScroll(currentUrlHash);
      }
    },


    mainHome: function() {
      // this.render("component/main/home");
      this.render("component/brief_info_item/browse", {parentCategoryItemId: constant.item.ROOT_PARENT_CATEGORY_ITEM_ID.toString()});
    },


    mainFaq: function() {
      this.render("component/main/faq");
    },


    mainContactus: function() {
      this.render("component/main/contact_us");
    },


    mainHowhaigyworks: function() {
      this.render("component/main/how_haigy_works");
    },


    mainCustomizedorderform: function() {
      this.render("component/main/customized_order_form");
    },


    mainComingsoon: function() {
      this.render("component/main/coming_soon");
    },


    detailedinfoitemShow: function(id) {
      this.render("component/detailed_info_item/show", {id: id});
    },


    briefinfoitemBrowse: function(parentCategoryItemId) {
      this.render("component/brief_info_item/browse", {parentCategoryItemId: parentCategoryItemId});
    },


    briefinfoitemSearch: function(keyword) {
      this.render("component/brief_info_item/search", {keyword: keyword});
    },


    briefinfoitemSubstitue: function(id) {
      this.render("component/brief_info_item/substitute", {id: id});
    },


    cartManage: function() {
      this.render("component/cart/manage");
    },


    cartShow: function(id) {
      this.render("component/cart/show/main", {id: id});
    },


    userAccountmanagement: function() {
      this.render("component/user/account_management/main");
    },


    userRecoverpassword: function() {
      this.render("component/user/password_recovery");
    },


    orderCheckout: function() {
      this.render("component/order/checkout/main");
    },


    orderIndex: function() {
      this.render("component/order/index");
    },


    orderShow: function(id) {
      this.render("component/order/show", {id: id});
    },


    orderPlacedreminder: function(id) {
      this.render("component/order/placed_reminder", {id: id});
    },


    // default action for unknown url hash
    mainUnknown: function() {
      navigator.mainHome();
    }
  });


  return router;
});