modulejs.define("app/error_handler", ["backbone"], function(Backbone) {
  "use strict";


  var errorHandler = function(errorMessage) {
    if (!errorMessage || errorMessage.toString().trim().length === 0) {
      errorMessage = "unknown error";
    }

    Backbone.history.navigate("#/main/error/" + encodeURIComponent(errorMessage), {trigger: true, replace: true});
  };


  return errorHandler;
});