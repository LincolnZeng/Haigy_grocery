modulejs.define("app/error_handler", [
  "alerter",
  "backbone",
  "react",
  "app/constant",
  "app/analytics",
  "app/navigator"
], function(alerter, Backbone, React, constant, analytics, navigator) {
  "use strict";


  // only when "hideErrorAlert === true", the alert will be shown.
  var errorHandler = function(errorCode, errorMessage, hideErrorAlert) {
    if (errorCode && errorCode.toString() === constant.errorCode.INVALID_TOKEN.toString()) {
      navigator.refresh();
    } else {
      if (!errorMessage || errorMessage.toString().trim().length === 0) {
        errorMessage = "unknown error";
      }
      analytics.error(errorMessage);
      if (hideErrorAlert !== true) {
        alerter(
          <div>
            <h3>Some unexpected error happened:</h3>
            <div className="haigy-font-color-red">{errorMessage}</div>
            <br />
            <div>We are so sorry for the inconvenience.</div>
            <br />
            <div>Could you please refresh the page and try it again? It might solve the problem. Thanks!</div>
          </div>
        );
      }
    }
  };


  return errorHandler;
});