modulejs.define("view/main/layout", [
  "logger",
  "backbone",
  "jst",
  "app/constant",
  "app/cached_request",
  "app/navigator",
  "app/utility",
  "app/error_handler",
  "model/session"
], function(logger, Backbone, JST, constant, cachedRequest, navigator, utility, errorHandler, sessionModel) {
  "use strict";


  var mainNoticeContainerId = constant.APP_LAYOUT_NOTICE_CONTAINER_HTML_ID;
  var mainNoticeContainerJquerySelector = ["#", mainNoticeContainerId].join("");


  var layoutView = Backbone.View.extend({
    className: "ui container",


    template: JST["template/main/layout"],


    render: function() {
      this.$el.html(this.template({navigator: navigator, mainNoticeContainerId: mainNoticeContainerId}));
      return this;
    },


    mainContentContainer: function() {
      return this.$("#main-layout-content-container");
    },


    mainNoticeContainer: function() {
      return this.$(mainNoticeContainerJquerySelector);
    },


    events: {
      "click #main-layout-signout": "signOut"
    },


    signOut: function(event) {
      event.preventDefault();

      cachedRequest.destroyModel(sessionModel, 1, {
        success: function() {
          utility.clearAllCacheAndCookie();

          navigator.tmp();
          navigator.mainHome({replace: true});
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/store/edit] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });
    }
  });


  return layoutView;
});