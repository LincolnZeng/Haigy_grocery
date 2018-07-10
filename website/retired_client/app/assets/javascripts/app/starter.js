modulejs.define("app/starter", [
  "document",
  "backbone",
  "jquery",
  "app/router",
  "app/constant",
  "app/utility",
  "app/cookie",
  "app/cache"
], function(document, Backbone, $, Router, constant, utility, cookie, cache) {
  "use strict";


  return {
    run: function() {
      function startWebApp() {
        $(function() {
          var cookieTimestamp = cookie.getCookieTimestamp();
          if (cookieTimestamp) {
            cache.cookieTimestamp.set(cookieTimestamp);
          } else {
            cookie.setCookieTimestamp();
          }

          var cookieVersion = cookie.getCookieVersion();
          if (cookieVersion && cookieVersion === constant.cookie.VERSION) {
            var token = cookie.tokenHandler.getToken();
            if (token) {
              utility.setTokenInAjaxRequest(token);
            }
          } else {
            cookie.clearAllCacheAndCookie();
            cookie.setCookieVersion();
          }

          new Router();
          if (!Backbone.History.started) {
            Backbone.history.start();
          }
        });
      }

      if (constant.IN_CORDOVA) {   // as a PhoneGap app
        var cordovaApp = {
          // Application Constructor
          initialize: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
          },

          onDeviceReady: function() {
            startWebApp();
          }
        };
        cordovaApp.initialize();
      } else {   // in web browsers
        startWebApp();
      }
    }
  };

});