modulejs.define("app/starter", [
  "document",
  "backbone",
  "jquery",
  "app/router",
  "app/constant"
], function(document, Backbone, $, Router, constant) {
  "use strict";


  return {
    run: function() {
      function startWebApp() {
        $(function() {
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