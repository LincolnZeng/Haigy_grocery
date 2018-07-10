modulejs.define("app/utility", [
  "window",
  "jquery",
  "lib/utility",
  "app/constant"
], function(window, $, libUtility, constant) {
  "use strict";


  var utility = {
    lib: libUtility,


    scrollTopPosition: function() {
      return $(window).scrollTop();
    },


    scrollTop: function(position) {
      if (position) {
        $(window).scrollTop(parseInt(position));
      } else {
        $(window).scrollTop(0);
      }
    },


    pathToUrl: function(path) {
      return [constant.DOMAIN, path].join("");
    },


    imagePathToUrl: function(imagePath) {
      return [constant.IMAGE_SERVER, imagePath].join("");
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


    // an example input for "outputDateStringFormat": "#{ww}, #{yyyy}-#{mm}-#{dd}". The output may look like "Sun, 2016-01-16"
    dateToString: function(date, outputDateStringFormat) {
      if (outputDateStringFormat) {
        var month = date.getMonth() + 1;
        var dateInMonth = date.getDate();
        return outputDateStringFormat.replace(/#{ww}/g, this.lib.abbreviatedWeekDays[date.getDay()])
          .replace(/#{yyyy}/g, date.getFullYear())
          .replace(/#{mm}/g, (month < 10 ? ["0", month].join("") : month))
          .replace(/#{dd}/g, (dateInMonth < 10? ["0", dateInMonth].join("") : dateInMonth));
      } else {
        return "";
      }
    },


    getDateFormatYYYYMMDD: function(date) {
      return this.dateToString(date, "#{yyyy}#{mm}#{dd}");
    },


    // convert a date string (or integer) with the format "yyyymmdd" to a Javascript Date object
    getOrderDeliveryDate: function(orderDeliveryDate) {
      if (orderDeliveryDate) {
        var dateInteger = parseInt(orderDeliveryDate);
        var year = dateInteger / 10000;
        var monthDate = dateInteger % 10000;
        return (new Date(year, monthDate / 100 - 1, monthDate % 100));
      } else {
        return null;
      }
    },


    // convert a date string (or integer) with the format "yyyymmdd" to a Javascript Date string
    getOrderDeliveryDateString: function(orderDeliveryDate) {
      var deliveryDate = this.getOrderDeliveryDate(orderDeliveryDate);
      if (deliveryDate) {
        return this.dateToString(deliveryDate, "#{ww}, #{mm}/#{dd}/#{yyyy}");
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
        var postFix = " pm";
        if (hour < 12) {
          postFix = " am";
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


    sanitizeString: function(originalString) {
      if (originalString) {
        return originalString.toString().replace(/\&/g, "&#38;").replace(/</g, "&#60;").replace(/\>/g, "&#62;")
          .replace(/\"/g, "&#34;").replace(/\'/g, "&#39;").replace(/\//g, "&#47;");
      } else {
        return "";
      }
    },


    getNormalizedAddressAttributeObject: function(serverResponsedAddressAttributeObject) {
      if (serverResponsedAddressAttributeObject) {
        return {
          id: serverResponsedAddressAttributeObject.id,
          userId: serverResponsedAddressAttributeObject.user_id,
          isBusinessAddress: serverResponsedAddressAttributeObject.is_business_address,
          businessName: serverResponsedAddressAttributeObject.business_name,
          streetAddress: serverResponsedAddressAttributeObject.street_address,
          city: serverResponsedAddressAttributeObject.city,
          state: serverResponsedAddressAttributeObject.state,
          zipCode: serverResponsedAddressAttributeObject.zip_code,
          note: serverResponsedAddressAttributeObject.note,
          setAsDefault: serverResponsedAddressAttributeObject.set_as_default,
          formattedAddress: [
            serverResponsedAddressAttributeObject.street_address, ", ",
            serverResponsedAddressAttributeObject.city, ", ",
            serverResponsedAddressAttributeObject.state, " ",
            serverResponsedAddressAttributeObject.zip_code
          ].join("")
        };
      } else {
        return {};
      }
    }
  };


  return utility;
});