modulejs.define("app/analytics", [
  "logger",
  "jquery",
  "app/constant",
  "app/utility",
  "app/cookie"
], function(logger, $, constant, utility, cookie) {
  "use strict";


  var saveAnalyticalEntry = function(keyword, details) {
    $.ajax({
      type: "POST",
      url: utility.pathToUrl("/analytical_entries"),
      data: {
        secret: constant.analytics.SECRET,
        analytical_entry: {
          source: "haigy_client",
          keyword: keyword,
          user_id: cookie.user.getUserId(),
          user_local_time: (new Date()).toLocaleString(),
          details: details
        }
      },
      success: function() {},   // do nothing if success
      error: function(jqXHR, textStatus, errorThrown) {
        logger(["Fail to save analytical data for :", keyword].join(""));
        logger(jqXHR);
        logger(textStatus);
        logger(errorThrown);
      },
      dataType: "json"
    });
  };


  var analytics = {
    error: function(errorMessage) {
      saveAnalyticalEntry("error", JSON.stringify({error_message: errorMessage}));
    },

    redirectToWelcomePage: function() {
      saveAnalyticalEntry("redirect to welcome page");
    },

    trialWithZipCode: function(zipCode) {
      saveAnalyticalEntry("trial with zip code", JSON.stringify({zip_code: zipCode}));
    },

    signUp: function() {
      saveAnalyticalEntry("sign up");
    },

    search: function(searchKeyword) {
      saveAnalyticalEntry("search", JSON.stringify({search_keyword: searchKeyword}));
    }
  };


  return analytics;
});