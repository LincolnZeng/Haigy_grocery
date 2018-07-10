modulejs.define("view/main/layout", [
  "underscore",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/navigator",
  "app/cookie",
  "app/utility",
  "app/analytics",
  "helper/select_user_address",
  "helper/session",
  "view/main/modal_search",
  "view/main/modal_busy",
  "view/user/modal_sign_in"
], function(
  _, Backbone, $, JST, constant, navigator, cookie, utility, analytics, selectuseraddressHelper,
  sessionHelper, mainModalsearchViewDef, mainModalbusyViewDef, userModalsigninViewDef
) {
  "use strict";


  var layoutView = Backbone.View.extend({
    initialize: function() {
      this.currentModal = null;
      this.addressHelper = null;

      _.bindAll(this, "customizeForCartManage");
    },


    id: "main-layout-container",


    mainT: JST["template/main/layout/main"],
    topNavT: JST["template/main/layout/_top_nav"],
    headerT: JST["template/main/layout/_header"],


    render: function() {
      this.$el.html(this.mainT({navigator: navigator}));
      this.refresh();

      return this;
    },


    mainContentContainer: function() {
      return this.$("#main-layout-content-container");
    },


    refresh: function() {
      var that = this;

      that.destroyAddressHelper();
      that.destroyCurrentModal();

      var token = cookie.tokenHandler.getToken();
      var zipCode = null;
      var isServableArea = false;
      var address = null;
      var userId = null;
      var userNickname = null;
      var userNicknameShort = null;

      if (token) {
        zipCode = cookie.user.getZipCode();
        isServableArea = cookie.user.isServableArea();
        if (token !== constant.session.GUEST_TOKEN) {
          var userAttributes = cookie.user.getSession().user;
          userId = userAttributes.id;
          userNickname = userAttributes.nickname;
          if (userNickname.length > 10) {
            userNicknameShort = [userNickname.substr(0, 10), "..."].join("");
          } else {
            userNicknameShort = userNickname;
          }
          address = cookie.user.getAddress();
        }
      }

      that.addressHelper = new selectuseraddressHelper({
        userId: userId,
        view: that,
        enableZipCodeChange: true,
        addressChangeCallback: function(needToRefreshShoppingCart) {
          if (needToRefreshShoppingCart) {
            navigator.refresh();
          } else {
            that.refresh();
          }
        },
        zipCodeChangeCallback: function(needToRefreshShoppingCart) {
          if (needToRefreshShoppingCart) {
            navigator.refresh();
          } else {
            that.refresh();
          }
        }
      });

      // prevent memory leak
      that.$("#main-layout-top-nav-info-content").popup("destroy");
      that.$(".main-layout-dropdown").dropdown("destroy");

      var topNavContainer = that.$("#main-layout-top-nav");
      topNavContainer.empty();
      topNavContainer.append(that.topNavT({
        userId: userId,
        zipCode: zipCode,
        isServableArea: isServableArea,
        noServiceWarning: constant.text.NO_SERVICE_WARNING,
        address: address,
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
      "click .main-layout-sign-in": "signIn",
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

      var token = cookie.tokenHandler.getToken();
      if (token) {
        if (token === constant.session.GUEST_TOKEN) {
          this.destroyCurrentModal();
          this.userSigninModal = new userModalsigninViewDef({closable: true, showSignUp: true});
          this.$el.append(this.userSigninModal.render().$el);
          this.userSigninModal.showModal();
        } else {
          navigator.userAccountmanagement(cookie.user.getSession().user.id);
        }
      } else {
        navigator.mainHome({replace: true});
      }
    },


    clickZipCode: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      if (this.addressHelper) {
        this.addressHelper.start();
      }
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
        analytics.search(searchValue);
        navigator.briefinfoitemSearch(searchValue);
      }
    },


    onSearchInputKeydown: function(event) {
      switch(event.which) {
        case 13:   // key: enter
          var searchValue = $(event.currentTarget).val().trim();
          if (searchValue.length > 0) {
            analytics.search(searchValue);
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


    signIn: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();

      this.destroyCurrentModal();
      this.currentModal = new userModalsigninViewDef({closable: true});
      this.$el.append(this.currentModal.render().$el);
      this.currentModal.showModal();
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
        utility.fixSemanticUiDimmerMemoryLeak();
        this.currentModal.remove();
        this.currentModal = null;
      }
    },


    // to prevent memory leak
    destroyAddressHelper: function() {
      if (this.addressHelper) {
        this.addressHelper.removeAllModals();
        this.addressHelper = null;
      }
    },


    customizeForCartManage: function() {
      var shoppingCartIconLinks = this.$(".main-layout-shopping-cart-icon-link");
      shoppingCartIconLinks.addClass("main-layout-go-back");
      shoppingCartIconLinks.prop('title', "Go Back");
      shoppingCartIconLinks.html("<i class='arrow left icon'></i>");

      var shoppingCartTextLinks = this.$(".main-layout-shopping-cart-text-link");
      shoppingCartTextLinks.addClass("main-layout-go-back");
      shoppingCartTextLinks.html("Go Back");
    },


    remove: function() {
      this.$("#main-layout-top-nav-info-content").popup("destroy");
      this.$(".main-layout-dropdown").dropdown("destroy");
      this.destroyAddressHelper();
      this.destroyCurrentModal();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return layoutView;
});