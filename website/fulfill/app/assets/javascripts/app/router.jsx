modulejs.define("app/router", [
  "backbone",
  "jquery",
  "react",
  "reactdom",
  "material_ui",
  "app/cookie",
  "app/cache",
  "app/constant",
  "app/utility",
  "app/navigator",
  "view/main/layout",
  "component/session/sign_in"
], function(Backbone, $, React, ReactDOM, MaterialUi, cookie, cache, constant, utility,
  navigator, mainLayoutViewDef, SessionSigninComponent
){
  "use strict";


  const MuiThemeProvider = MaterialUi.MuiThemeProvider;
  var mainLayout = null;
  var mainContentContainer = null;
  var mainNoticeContainer = null;
  var mainLayoutReady = false;
  var currentUrlHash = null;
  var currentView = null;
  var redirectToUserSearchPage = false;


  var router = Backbone.Router.extend({
    routes: {
      "": "mainHome",
      "main/faq": "mainFaq",
      "main/error/:errorMessage": "mainError",

      "briefInfoItems/browse/:parentCategoryItemId": "briefinfoitemBrowse",
      "briefInfoItems/search/:keyword": "briefinfoitemSearch",
      "briefInfoItem/:id/substitue": "briefinfoitemSubstitue",

      "detailedInfoItem/:id/show": "detailedinfoitemShow",

      "carts/manage": "cartManage",

      "users/search": "userSearch",

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

        var token = cookie.tokenHandler.getToken();
        if (token) {
          that.refreshLayout();
          var userId = cookie.user.getUserId();
          if (userId || redirectToUserSearchPage) {
            redirectToUserSearchPage = false;
            callback.apply(that, args);
          } else {
            redirectToUserSearchPage = true;
            navigator.tmp();
            navigator.userSearch({replace: true});
          }
        } else {
          if (mainContentContainer) {
            ReactDOM.unmountComponentAtNode(mainContentContainer.get(0));
            mainContentContainer.empty();
          }
          if (mainNoticeContainer) {
            ReactDOM.unmountComponentAtNode(mainNoticeContainer.get(0));
          }
          cookie.clearAllCacheAndCookie();   // make the website be able to recover from an unexpect crash by itself
          that.refreshLayout();
          ReactDOM.render(<MuiThemeProvider muiTheme={MaterialUi.getMuiTheme()}><SessionSigninComponent /></MuiThemeProvider>, mainContentContainer.get(0));
        }
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
        mainNoticeContainer = mainLayout.mainNoticeContainer();
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


    render: function(viewModuleName, options) {
      currentUrlHash = navigator.current();
      var viewDef = modulejs.require(viewModuleName);
      currentView = new viewDef(options);
      ReactDOM.unmountComponentAtNode(mainContentContainer.get(0));
      ReactDOM.unmountComponentAtNode(mainNoticeContainer.get(0));
      mainContentContainer.empty();
      mainContentContainer.append(currentView.render().$el);
      this.recoverScroll(currentUrlHash);
    },


    reactRender: function(componentModuleName, options) {
      currentUrlHash = navigator.current();
      var ComponentDef = modulejs.require(componentModuleName);
      ReactDOM.unmountComponentAtNode(mainContentContainer.get(0));
      ReactDOM.unmountComponentAtNode(mainNoticeContainer.get(0));
      mainContentContainer.empty();
      ReactDOM.render(<MuiThemeProvider muiTheme={MaterialUi.getMuiTheme()}><ComponentDef options={options} /></MuiThemeProvider>, mainContentContainer.get(0));
      this.recoverScroll(currentUrlHash);
    },


    mainHome: function() {
      this.render("view/brief_info_item/browse", {parentCategoryItemId: constant.item.ROOT_PARENT_CATEGORY_ITEM_ID});
    },


    mainFaq: function() {
      this.render("view/main/faq");
    },


    mainError: function(errorMessage) {
      this.render("view/main/error", {
        errorMessage: errorMessage
      });
    },


    briefinfoitemBrowse: function(parentCategoryItemId) {
      this.render("view/brief_info_item/browse", {parentCategoryItemId: parentCategoryItemId});
    },


    briefinfoitemSearch: function(keyword) {
      this.render("view/brief_info_item/search", {keyword: keyword});
    },


    briefinfoitemSubstitue: function(id) {
      this.reactRender("component/brief_info_item/substitute", {id: id});
    },


    detailedinfoitemShow: function(id) {
      this.render("view/detailed_info_item/show", {id: id});
    },


    cartManage: function() {
      this.reactRender("component/cart/manage/main", {customizeLayout: mainLayout.customizeForCartManage});
    },


    userSearch: function() {
      this.reactRender("component/user/search");
    },


    // default action for unknown url hash
    mainUnknown: function() {
      navigator.mainHome();
    }
  });


  return router;
});