modulejs.define("app/starter", [
  "document",
  "backbone",
  "jquery",
  "app/router",
  "app/constant",
  "app/utility",
  "app/cookie",
  "helper/session"
], function(document, Backbone, $, Router, constant, utility, cookie, sessionHelper) {
  "use strict";


  return {
    run: function() {
      function startWebApp() {
        $(function() {
          sessionHelper.synchronizeSession();

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
            document.addEventListener("deviceready", this.onDeviceReady, false);
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