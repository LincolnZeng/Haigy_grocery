modulejs.define("haigy/lib/1.1.0/validator", function() {
  "use strict";


  var validator = {
    minLength: function(inputString, minLength, trimNeededBeforeValidate, invalidCallback, validCallback) {
      var isValid = false;
      if (inputString) {
        var sortedString = inputString.toString();
        if (trimNeededBeforeValidate) {
          sortedString = sortedString.trim();
        }
        if (sortedString.length >= minLength) {
          isValid = true;
        }
      }
      if (isValid) {
        if (validCallback) {validCallback();}
      } else {
        if (invalidCallback) {invalidCallback();}
      }
      return isValid;
    },


    maxLength: function(inputString, maxLength, trimNeededBeforeValidate, invalidCallback, validCallback) {
      var isValid = true;
      if (inputString) {
        var sortedString = inputString.toString();
        if (trimNeededBeforeValidate) {
          sortedString = sortedString.trim();
        }
        if (sortedString.length > maxLength) {
          isValid = false;
        }
      }
      if (isValid) {
        if (validCallback) {validCallback();}
      } else {
        if (invalidCallback) {invalidCallback();}
      }
      return isValid;
    },


    usZipCode: function(zipCode, invalidCallback, validCallback) {
      var isValid = zipCode && /^[0-9]{5}$/.test(zipCode.toString());
      if (isValid) {
        if (validCallback) {validCallback("Zip code is valid.");}
      } else {
        if (invalidCallback) {invalidCallback("Zip code is not valid.");}
      }
      return isValid;
    },


    usPhone: function(phoneNumber, invalidCallback, validCallback) {
      var isValid = phoneNumber && /^\([0-9]{3}\)\ [0-9]{3}-[0-9]{4}$/.test(phoneNumber.toString());
      if (isValid) {
        if (validCallback) {validCallback("Phone number is valid.");}
      } else {
        if (invalidCallback) {invalidCallback("Phone number is not valid.");}
      }
      return isValid;
    },


    email: function(emailAddress, invalidCallback, validCallback) {
      var isValid = emailAddress && /^\s*\S+@\S+\.\S+\s*$/.test(emailAddress.toString());
      if (isValid) {
        if (validCallback) {validCallback("Email address is valid.");}
      } else {
        if (invalidCallback) {invalidCallback("Email address is not valid.");}
      }
      return isValid;
    },


    facebookMessager: function(facebookMessagerAccount, invalidCallback, validCallback) {
      var isValid = facebookMessagerAccount && facebookMessagerAccount.toString().length > 3;
      if (isValid) {
        if (validCallback) {validCallback("Facebook messager account is valid.");}
      } else {
        if (invalidCallback) {invalidCallback("Facebook messager account is not valid.");}
      }
      return isValid;
    },


    password: function(password, invalidCallback, validCallback) {
      var isValid = false;
      var inValidMessage = null;
      if (password) {
        var passwordLength = password.toString().length;
        if (passwordLength < 8) {
          inValidMessage = "Password is too short (minimum is 8 characters).";
        } else if (passwordLength > 50) {
          inValidMessage = "Password is too long (maximun is 50 characters).";
        } else {
          isValid = true;
        }
      } else {
        inValidMessage = "Password cannot be blank.";
      }

      if (isValid) {
        if (validCallback) {validCallback("Password is valid.");}
      } else {
        if (invalidCallback) {invalidCallback(inValidMessage);}
      }
      return isValid;
    }
  };


  return validator;
});