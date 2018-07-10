modulejs.define("app/utility", [
  "lib/backbone_cache",
  "app/cached_request",
  "app/cookie",
  "app/constant"
], function(backboneCache, cachedRequest, cookie, constant) {
  "use strict";


  var utilities = {
    pathToUrl: function(path) {
      return [constant.DOMAIN, path].join("");
    },


    clearAllCacheAndCookie: function() {
      cachedRequest.tokenHandler.clearToken();
      backboneCache.clearAll();
      cookie.clearAll();
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


    getInstacartItemUrl: function(instacartItemId) {
      return ["https://www.instacart.com/store/items/", instacartItemId].join("");
    }
  };




  return utilities;
});