modulejs.define("app/analytics", [
  "logger",
  "jquery",
  "app/constant",
  "app/utility",
  "app/cookie"
], function(logger, $, constant, utility, cookie) {
  "use strict";


  var saveAnalyticalEntry = function(keyword, details) {
    logger("----------");
    logger(keyword);
    logger(details);
    logger("----------");

    // No analytical record will be stored in the database for the demonstration website.
    //
    // $.ajax({
    //   type: "POST",
    //   url: utility.pathToUrl("/analytical_entries"),
    //   data: {
    //     secret: constant.analytics.SECRET,
    //     analytical_entry: {
    //       source: "haigy_client",
    //       keyword: keyword,
    //       user_id: cookie.user.getUserId(),
    //       user_local_time: (new Date()).toLocaleString(),
    //       details: details
    //     }
    //   },
    //   success: function() {},   // do nothing if success
    //   error: function(jqXHR, textStatus, errorThrown) {
    //     logger(["Fail to save analytical data for :", keyword].join(""));
    //     logger(jqXHR);
    //     logger(textStatus);
    //     logger(errorThrown);
    //   },
    //   dataType: "json"
    // });
  };


  var analytics = {
    error: function(errorMessage) {
      saveAnalyticalEntry("error", JSON.stringify({error_message: errorMessage}));
    },

    howhaigyworksPageVisited: function() {
      saveAnalyticalEntry("How Haigy works page visited");
    },

    faqPageVisited: function() {
      saveAnalyticalEntry("FAQ page visited");
    },

    browsingCategory: function(categoryName) {
      saveAnalyticalEntry("Browsing Category", JSON.stringify({category_name: categoryName}));
    },

    browsingItem: function(itemName) {
      saveAnalyticalEntry("Browsing Item", JSON.stringify({item_name: itemName}));
    },

    itemSearched: function(searchKeyword) {
      saveAnalyticalEntry("Item Search", JSON.stringify({keyword: searchKeyword}));
    },


    // todo: delete below three methods
    homePageVisited: function() {
      saveAnalyticalEntry("Home page visited");
    },

    seePokemonGoMap: function() {
      saveAnalyticalEntry("See Pokemon Go Map");
    },

    tryToBrowseAllGroceries: function() {
      saveAnalyticalEntry("Try to browse all groceries");
    }
  };


  return analytics;
});