modulejs.define("app/utility", [
  "document",
  "jquery",
  "lib/utility",
  "app/constant"
], function(document, $, libUtility, constant) {
  "use strict";


  var utility = {
    lib: libUtility,


    scrollTopPosition: function() {
      return $(document).scrollTop();
    },


    scrollTop: function(position) {
      if (position) {
        $(document).scrollTop(parseInt(position));
      } else {
        $(document).scrollTop(0);
      }
    },


    pathToUrl: function(path) {
      return [constant.DOMAIN, path].join("");
    },


    imagePathToUrl: function(imagePath) {
      return [constant.IMAGE_SERVER, imagePath].join("");
    },


    // this function should be called everytime website starts or token changes
    setTokenInAjaxRequest: function(token) {
      var tokenHeader = {};
      tokenHeader[constant.session.REQUEST_HEADER_TOKEN_ATTRIBUTE] = token;
      $.ajaxSetup({
        headers: tokenHeader
      });
    },


    // this will fix the memory leak bug that is caused by Semantic UI multiple modals feature.
    // this should be used after switching between modals but not turning off the dimmer.
    fixSemanticUiDimmerMemoryLeak: function() {
      $(".ui.dimmer.modals").off("click");
      $(".dimmable.scrolling").off("scroll");
    }
  };


  return utility;
});