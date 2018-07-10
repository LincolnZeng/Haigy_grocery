modulejs.define("haigy/lib/1.0.0/validator", function() {
  "use strict";


  var validator = {
    alwaysGood: function() {
      return true;
    },


    notEmpty: function(input) {
      if (input) {
        if (input.toString().trim().length > 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },


    goodLength: function(input, minimumLength, maximumLength) {
      if (input) {
        var inputString = input.toString();
        if (minimumLength && inputString.length < parseInt(minimumLength)) {
          return false;
        }
        if (maximumLength && inputString.length > parseInt(maximumLength)) {
          return false;
        }
        return true;
      } else {
        return false;
      }
    },


    email: function(input) {
      return /\S+@\S+/.test(input);
    },


    password: function(input) {
      return /^\S{8,50}$/.test(input);
    },


    emptyOrPassword: function(input) {
      if (input.length > 0) {
        return /^\S{8,50}$/.test(input);
      } else {
        return true;
      }
    },


    floatNumber: function(input) {
      var inputNumber = input.trim();
      if (inputNumber.length > 0) {
        return !isNaN(inputNumber);
      } else {
        return false;
      }
    },


    emptyOrFloatNumber: function(input) {
      var inputNumber = input.trim();
      if (inputNumber.length > 0) {
        return !isNaN(inputNumber);
      } else {
        return true;
      }
    }
  };


  return validator;
});