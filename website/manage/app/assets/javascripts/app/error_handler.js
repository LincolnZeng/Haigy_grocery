modulejs.define("app/error_handler", ["backbone", "app/constant", "app/navigator"], function(Backbone, constant, navigator) {
  "use strict";


  var errorHandler = function(errorCode, errorMessage) {
    if (errorCode && errorCode.toString() === constant.errorCode.INVALID_TOKEN.toString()) {
      navigator.refresh();
    } else {
      if (!errorMessage || errorMessage.toString().trim().length === 0) {
        errorMessage = "unknown error";
      }
      var currentUrlHash = navigator.current();
      navigator.mainError(errorMessage, {trigger: true, replace: true});
      navigator.visit(currentUrlHash, {trigger: false, replace: true});
    }
  };


  return errorHandler;
});