modulejs.define("haigy/lib/1.1.0/utility", function() {
  "use strict";


  var utility = {
    abbreviatedWeekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],


    // formatted US phone number
    formattedUsPhoneNumber: function(phoneNumber) {
      var sortedNumber = phoneNumber.toString().replace(/\D/g, "");
      var numberlength = sortedNumber.length;
      if (numberlength === 0) {
        return "";
      } else if (numberlength < 4) {
        return ["(", sortedNumber].join("");
      } else if (numberlength < 7) {
        return ["(", sortedNumber.substring(0, 3), ") ", sortedNumber.substring(3)].join("");
      } else {
        return ["(", sortedNumber.substring(0, 3), ") ", sortedNumber.substring(3, 6), "-", sortedNumber.substring(6, 10)].join("");
      }
    },


    itemSubstitute: {
      parseLookupString: function(serverResponsedLookupString) {
        try {
          var parsedLookupObject = JSON.parse(serverResponsedLookupString);
          if (parsedLookupObject && typeof parsedLookupObject === "object") {
            // "createdAt" could be used to check if the lookup is set or not, and if the lookup is stale or not.
            var createdAt = parsedLookupObject.created_at;
            if (createdAt) {
              createdAt = parseInt(createdAt);
              if (isNaN(createdAt)) {return {};}
            }
            return {
              categoryId: parsedLookupObject.category_id,
              categoryName: parsedLookupObject.category_name || "Unknown",
              keyword: parsedLookupObject.keyword || "",
              createdAt: createdAt
            };
          } else {
            return {};
          }
        } catch(error) {
          return {};
        }
      },

      generateLookupString: function(lookupCategoryId, lookupCategoryName, lookupKeywords) {
        var currentTime = new Date();
        return JSON.stringify({
          category_id: lookupCategoryId,
          category_name: lookupCategoryName,
          keyword: lookupKeywords,
          created_at: currentTime.getTime()
        });
      }
    }
  };


  return utility;
});