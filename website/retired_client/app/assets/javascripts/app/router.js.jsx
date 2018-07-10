modulejs.define("app/router", [
  "backbone",
  "jquery",
  "reactdom",
  "app/cookie",
  "app/cache",
  "app/constant",
  "app/utility",
  "app/navigator",
  "app/analytics",
  "view/main/layout"
], function(Backbone, $, ReactDOM, cookie, cache, constant, utility, navigator, analytics, mainLayoutViewDef){
  "use strict";


  var mainLayout = null;
  var mainContentContainer = null;
  var mainLayoutReady = false;
  var currentUrlHash = null;
  var currentView = null;
  var satisfyRenderConstrain = false;


  var router = Backbone.Router.extend({
    routes: {
      "": "mainHome",
      "main/welcome/:zipCode": "mainWelcome",
      "main/faq": "mainFaq",
      "main/error/:errorMessage": "mainError",

      "briefInfoItems/browse/:parentCategoryItemId": "briefinfoitemBrowse",
      "briefInfoItems/search/:keyword": "briefinfoitemSearch",

      "detailedInfoItem/:id/show": "detailedinfoitemShow",

      "carts/manage": "cartManage",
      "carts/specialRequest/:jsonParams": "cartSpecialrequest",

      "users/signUp/:jsonParams": "userSignup",
      "users/recoverPassword": "userRecoverpassword",
      "user/:id/accountManagement": "userAccountmanagement",

      "orders/userCheckout": "orderUsercheckout",
      "orders/guestCheckout": "orderGuestcheckout",
      "orders/review": "orderReview",
      "orders/index": "orderIndex",
      "order/:id/show": "orderShow",

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

        if (currentView) {   // prevent memory leak
          currentView.remove();
          currentView = null;
        }

        satisfyRenderConstrain = true;
        var token = cookie.tokenHandler.getToken();
        if (token) {
          var zipCode = cookie.user.getZipCode();
          var serviceAreaId = cookie.user.getServiceAreaId();
          if (zipCode && serviceAreaId) {
            if (token !== constant.session.GUEST_TOKEN) {
              var session = cookie.user.getSession();
              if (!(session && session.user)) {
                satisfyRenderConstrain = false;
              }
            }
          } else {
            satisfyRenderConstrain = false;
          }
        } else {
          satisfyRenderConstrain = false;
        }

        if (!satisfyRenderConstrain) {
          cookie.clearAllCacheAndCookie();   // make the website be able to recover from an unexpect crash by itself
        }

        that.refreshLayout();

        callback.apply(that, args);
      });
    },


    refreshLayout: function() {
      if (mainLayoutReady) {
        mainLayout.refresh();
      } else {
        mainLayout = new mainLayoutViewDef();
        mainLayout.render();
        $("body").empty();
        $("body").append(mainLayout.$el);
        mainContentContainer = mainLayout.mainContentContainer();
        mainLayoutReady = true;
      }
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


    // zip code required
    render: function(viewModuleName, options) {
      if (satisfyRenderConstrain) {
        this.renderWithoutConstrain(viewModuleName, options);
      } else {
        analytics.redirectToWelcomePage();
        navigator.mainWelcome(constant.DEFAULT_ZIP_CODE, {replace: true});
      }
    },


    // no zip code required
    renderWithoutConstrain: function(viewModuleName, options) {
      currentUrlHash = navigator.current();
      var viewDef = modulejs.require(viewModuleName);
      currentView = new viewDef(options);
      ReactDOM.unmountComponentAtNode(mainContentContainer.get(0));
      mainContentContainer.empty();
      mainContentContainer.append(currentView.render().$el);
      this.recoverScroll(currentUrlHash);
    },


    // zip code required
    reactRender: function(componentModuleName, options) {
      if (satisfyRenderConstrain) {
        this.reactRenderWithoutConstrain(componentModuleName, options);
      } else {
        analytics.redirectToWelcomePage();
        navigator.mainWelcome(constant.DEFAULT_ZIP_CODE, {replace: true});
      }
    },


    // no zip code required
    reactRenderWithoutConstrain: function(componentModuleName, options) {
      currentUrlHash = navigator.current();
      var ComponentDef = modulejs.require(componentModuleName);
      ReactDOM.unmountComponentAtNode(mainContentContainer.get(0));
      mainContentContainer.empty();
      ReactDOM.render(<ComponentDef options={options} />, mainContentContainer.get(0));
      this.recoverScroll(currentUrlHash);
    },


    mainHome: function() {
      this.render("view/brief_info_item/browse", {parentCategoryItemId: constant.item.ROOT_PARENT_CATEGORY_ITEM_ID});
    },


    mainWelcome: function(zipCode) {
      this.renderWithoutConstrain("view/main/welcome", {zipCode: zipCode});
    },


    mainFaq: function() {
      this.renderWithoutConstrain("view/main/faq");
    },


    mainError: function(errorMessage) {
      this.renderWithoutConstrain("view/main/error", {
        errorMessage: errorMessage
      });
    },


    briefinfoitemBrowse: function(parentCategoryItemId) {
      this.render("view/brief_info_item/browse", {parentCategoryItemId: parentCategoryItemId});
    },


    briefinfoitemSearch: function(keyword) {
      this.render("view/brief_info_item/search", {keyword: keyword});
    },


    detailedinfoitemShow: function(id) {
      this.renderWithoutConstrain("view/detailed_info_item/show", {id: id});
    },


    cartManage: function() {
      this.render("view/cart/manage", {customizeLayout: mainLayout.customizeForCartManage});
    },


    cartSpecialrequest: function(jsonParams) {
      this.render("view/cart/special_request", {jsonParams: jsonParams});
    },


    userSignup: function(jsonParams) {
      this.renderWithoutConstrain("view/user/sign_up", {jsonParams: jsonParams});
    },


    userRecoverpassword: function() {
      this.renderWithoutConstrain("view/user/recover_password");
    },


    userAccountmanagement: function(id) {
      this.render("view/user/account_management", {id: id});
    },


    orderUsercheckout: function() {
      this.render("view/order/user_checkout");
    },


    orderGuestcheckout: function() {
      this.render("view/order/guest_checkout");
    },


    orderReview: function() {
      this.render("view/order/review");
    },


    orderIndex: function() {
      this.render("view/order/index");
    },


    orderShow: function(id) {
      this.renderWithoutConstrain("view/order/show", {id: id});
    },


    // default action for unknown url hash
    mainUnknown: function() {
      navigator.mainHome();
    }
  });


  return router;
});