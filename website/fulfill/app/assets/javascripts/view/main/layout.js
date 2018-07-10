modulejs.define("view/main/layout", [
  "alerter",
  "logger",
  "underscore",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/navigator",
  "app/cookie",
  "app/utility",
  "app/cached_request",
  "app/error_handler",
  "model/session",
  "view/main/modal_search",
  "view/main/modal_busy"
], function(
  alerter, logger, _, Backbone, $, JST, constant, navigator, cookie, utility, cachedRequest,
  errorHandler, sessionModel, mainModalsearchViewDef, mainModalbusyViewDef
) {
  "use strict";


  var mainNoticeContainerId = constant.APP_LAYOUT_NOTICE_CONTAINER_HTML_ID;
  var mainNoticeContainerJquerySelector = ["#", mainNoticeContainerId].join("");


  var layoutView = Backbone.View.extend({
    initialize: function() {
      this.currentModal = null;

      _.bindAll(this, "customizeForCartManage");
    },


    id: "main-layout-container",


    mainT: JST["template/main/layout/main"],
    topNavT: JST["template/main/layout/_top_nav"],
    headerT: JST["template/main/layout/_header"],


    render: function() {
      this.$el.html(this.mainT({navigator: navigator, mainNoticeContainerId: mainNoticeContainerId}));
      this.refresh();

      return this;
    },


    mainContentContainer: function() {
      return this.$("#main-layout-content-container");
    },


    mainNoticeContainer: function() {
      return this.$(mainNoticeContainerJquerySelector);
    },


    refresh: function() {
      var that = this;

      that.destroyCurrentModal();

      var zipCode = cookie.user.getZipCode();
      var userId = cookie.user.getUserId();
      var userNickname = cookie.user.getNickname();
      var userNicknameShort = null;
      if (userNickname) {
        if (userNickname.length > 10) {
          userNicknameShort = [userNickname.substr(0, 10), "..."].join("");
        } else {
          userNicknameShort = userNickname;
        }
      }

      // prevent memory leak
      that.$("#main-layout-top-nav-info-content").popup("destroy");
      that.$(".main-layout-dropdown").dropdown("destroy");

      var topNavContainer = that.$("#main-layout-top-nav");
      topNavContainer.empty();
      topNavContainer.append(that.topNavT({
        userId: userId,
        zipCode: zipCode,
        userNickname: userNickname,
        userNicknameShort: userNicknameShort,
        navigator: navigator
      }));

      var headerContainer = that.$("#main-layout-header");
      headerContainer.empty();
      headerContainer.append(that.headerT({zipCode: zipCode, navigator: navigator}));

      that.$("#main-layout-top-nav-info-content").popup({
        inline: true,
        position: "bottom left",
        variation: "very wide",
        delay: {show: 350, hide: 200}
      });

      that.$(".main-layout-dropdown").dropdown({action: "nothing"});
    },


    events: {
      "click .main-layout-go-back": "onGoBack",
      "click #main-layout-top-nav-user-nickname": "clickUserNickname",
      "click #main-layout-top-nav-zip-code": "clickZipCode",
      "click #main-layout-top-nav-search,.main-layout-search": "showSearchModal",
      "click #main-layout-search-input-start-search": "startSearch",
      "keydown #main-layout-search-input": "onSearchInputKeydown",
      "click .main-layout-prevent-default": "preventDefault",
      "click .main-layout-link": "clickOnLink",
      "click .main-layout-sign-out": "signOut"
    },


    onGoBack: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();
      navigator.back();
    },


    clickUserNickname: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      navigator.userSearch();
    },


    clickZipCode: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      alerter("We might add some functionality to switch between zip codes in the future.");
    },


    showSearchModal: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      this.destroyCurrentModal();
      this.currentModal = new mainModalsearchViewDef();
      this.$el.append(this.currentModal.render().$el);
      this.currentModal.showModal();
    },


    startSearch: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      var searchValue = $("#main-layout-search-input").val().trim();
      if (searchValue.length > 0) {
        navigator.briefinfoitemSearch(searchValue);
      }
    },


    onSearchInputKeydown: function(event) {
      switch(event.which) {
      case 13:   // key: enter
        var searchValue = $(event.currentTarget).val().trim();
        if (searchValue.length > 0) {
          navigator.briefinfoitemSearch(searchValue);
        }
        return;
      case 27:   // key: esc
        $(event.currentTarget).val("");
        return;
      }
    },


    preventDefault: function(event) {
      event.preventDefault();
    },


    clickOnLink: function(event) {
      event.preventDefault();
      var link = $(event.currentTarget).data("link");
      navigator.visit(link);
    },


    signOut: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      this.destroyCurrentModal();
      this.currentModal = new mainModalbusyViewDef({
        header: "Sign out ...",
        onVisibleCallback: function() {
          cachedRequest.destroyModel(sessionModel, 1, {
            success: function() {
              cookie.clearAllCacheAndCookie();
              navigator.tmp();
              navigator.mainHome({replace: true});
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/main/layout] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
        }
      });
      this.$el.append(this.currentModal.render().$el);
      this.currentModal.showModal();
    },


    // to prevent memory leak
    destroyCurrentModal: function() {
      if (this.currentModal) {
        utility.fixSemanticUiDimmerMemoryLeak();
        this.currentModal.remove();
        this.currentModal = null;
      }
    },


    customizeForCartManage: function() {
      var shoppingCartIconLinks = this.$(".main-layout-shopping-cart-icon-link");
      shoppingCartIconLinks.addClass("main-layout-go-back");
      shoppingCartIconLinks.prop("title", "Go Back");
      shoppingCartIconLinks.html("<i class='arrow left icon'></i>");

      var shoppingCartTextLinks = this.$(".main-layout-shopping-cart-text-link");
      shoppingCartTextLinks.addClass("main-layout-go-back");
      shoppingCartTextLinks.html("Go Back");
    },


    remove: function() {
      this.$("#main-layout-top-nav-info-content").popup("destroy");
      this.$(".main-layout-dropdown").dropdown("destroy");
      this.destroyCurrentModal();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return layoutView;
});