modulejs.define("app/utility", [
  "document",
  "jquery",
  "app/constant"
], function(document, $, constant) {
  "use strict";


  var utility = {
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


    // an example input for "outputDateStringFormat": "#{yyyy}-#{mm}-#{dd}". The output may look like "2016-01-16"
    dateToString: function(date, outputDateStringFormat) {
      if (outputDateStringFormat) {
        var month = date.getMonth() + 1;
        var dateInMonth = date.getDate();
        return outputDateStringFormat.replace(/#{yyyy}/g, date.getFullYear())
          .replace(/#{mm}/g, (month < 10 ? ["0", month].join("") : month))
          .replace(/#{dd}/g, (dateInMonth < 10? ["0", month].join("") : dateInMonth));
      } else {
        return "";
      }
    },


    getOrderStatus: function(orderStatusId) {
      var id = parseInt(orderStatusId);
      var orderStatus = constant.order.STATUS;
      for (var key in orderStatus) {
        if (orderStatus[key] === id) {
          return key.toUpperCase();
        }
      }
    },


    // convert a date string (or integer) with the format "yyyymmdd" to a Javascript Date string
    getOrderDeliveryDate: function(orderDeliveryDate) {
      if (orderDeliveryDate) {
        var dateInteger = parseInt(orderDeliveryDate);
        var year = dateInteger / 10000;
        var monthDate = dateInteger % 10000;
        return (new Date(year, monthDate / 100 - 1, monthDate % 100)).toDateString();
      } else {
        return "N/A";
      }
    },


    // convert the number of minutes since the start of the day to a human readable time string "hh:mm am/pm"
    getOrderDeliveryTimeSlotTime: function(orderDeliveryTimeSlotTime) {
      if (orderDeliveryTimeSlotTime || orderDeliveryTimeSlotTime === 0) {
        var timeInteger = parseInt(orderDeliveryTimeSlotTime);
        var hour = timeInteger / 60;
        var minute = timeInteger % 60;
        var postFix = "pm";
        if (hour < 12) {
          postFix = "am";
        } else {
          if (hour > 12) {
            hour -= 12;
          }
        }
        if (minute < 10) {
          minute = ["0", minute].join("");
        }
        return [hour, ":", minute, postFix].join("");
      } else {
        return "N/A";
      }
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
    },


    sanitizeString: function(originalString) {
      if (originalString) {
        return originalString.toString().replace(/\&/g, "&#38;").replace(/</g, "&#60;").replace(/\>/g, "&#62;")
          .replace(/\"/g, "&#34;").replace(/\'/g, "&#39;").replace(/\//g, "&#47;");
      } else {
        return "";
      }
    }
  };


  return utility;
});