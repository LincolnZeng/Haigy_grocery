modulejs.define("haigy/lib/1.0.0/easy_form", [
  "haigy/lib/1.0.0/validator",
  "jquery"
], function(defaultValidator, $) {
  "use strict";


  // only consider "true" and "false" in "arrayForValidationResults"
  // "true" means passed the validation
  // "false" means failed the validation
  // others could mean optional validation results
  // ------
  // only display the valid infomation that is just before the first failed validation
  // for example: if "arrayForValidationResults" = [true, true, false, false, true], then display "arrayForValidInfoElements[1]"
  // if "arrayForValidationResults" = [false, false, true, true], then display nothing
  // if "arrayForValidationResults" = [true, true, true, true], then display "arrayForValidInfoElements[3]"
  // if "arrayForValidInfoElements" is too short to match above rules, display the last one when all validations passed after it
  var defaultValidHandler = function(inputElement, arrayForValidationResults, arrayForValidInfoElements) {
    var elementCount = arrayForValidInfoElements.length;
    if (elementCount > 0) {
      for (var elementIndex = 0; elementIndex < elementCount; ++elementIndex) {
        arrayForValidInfoElements[elementIndex].hide();
      }

      var validationCount = arrayForValidationResults.length;
      if (validationCount > 0 && arrayForValidationResults[0] !== false) {
        var displayIndex = 0;

        if (validationCount > elementCount) {
          var matchCount = elementCount - 1;
          var passAllMatchedValidation = true;
          for (var matchIndex = 1; matchIndex < matchCount; ++matchIndex) {
            if (arrayForValidationResults[matchIndex] === false) {   // ignore "true" or other validation results (optional validation)
              passAllMatchedValidation = false;
              break;
            } else {
              displayIndex = matchIndex;
            }
          }
          if (passAllMatchedValidation) {
            var allPass = true;
            for (var unmatchIndex = matchCount; unmatchIndex < validationCount; ++unmatchIndex) {
              if (arrayForValidationResults[unmatchIndex] === false) {   // ignore "true" or other validation results (optional validation)
                allPass = false;
                break;
              }
            }
            if (allPass) {
              displayIndex = elementCount - 1;
            }
          }
        } else {
          for (var validationIndex = 1; validationIndex < validationCount; ++validationIndex) {
            if (arrayForValidationResults[validationIndex] === false) {   // ignore "true" or other validation results (optional validation)
              break;
            } else {
              displayIndex = validationIndex;
            }
          }
        }

        arrayForValidInfoElements[displayIndex].show();
      }
    }
  };


  // only display the first invalid information
  // for example: if "arrayForValidationResults" = [true, true, false, false, true], then display "arrayForInvalidInfoElements[2]"
  // if "arrayForValidationResults" = [false, false, true, true], then display "arrayForInvalidInfoElements[0]"
  // if "arrayForValidationResults" = [true, true, true, true], then display nothing
  // if "arrayForInvalidInfoElements[displayIndex]" is not too short to match above rules, display the last one when there is any failed validation after it.
  var defaultInvalidHandler = function(inputElement, arrayForValidationResults, arrayForInvalidInfoElements) {
    var elementCount = arrayForInvalidInfoElements.length;
    if (elementCount > 0) {
      for (var elementIndex = 0; elementIndex < elementCount; ++elementIndex) {
        arrayForInvalidInfoElements[elementIndex].hide();
      }

      var allValidationPass = true;
      var displayIndex = 0;
      var validationCount = arrayForValidationResults.length;
      if (validationCount > 0) {
        for (var validationIndex = 0; validationIndex < validationCount; ++validationIndex) {
          if (arrayForValidationResults[validationIndex] === false) {
            displayIndex = validationIndex;
            allValidationPass = false;
            break;
          }
        }
      }

      if (!allValidationPass) {
        if (displayIndex >= elementCount) {
          displayIndex = elementCount - 1;
        }
        arrayForInvalidInfoElements[displayIndex].show();
      }
    }
  };


  var defaultTextDisplayHandler = function(inputElement, arrayForTextDisplayElements) {
    var count = arrayForTextDisplayElements.length;
    for (var index = 0; index < count; ++index) {
      arrayForTextDisplayElements[index].html(inputElement.val());
    }
  };


  var defaultRadioSelectHandler = function(radioElement, arrayForRadioElementSelectRelatedElements, arrayForAllSelectRelatedElements) {
    var allSelectElementsCount = arrayForAllSelectRelatedElements.length;
    for (var allSelectElementIndex = 0; allSelectElementIndex < allSelectElementsCount; ++allSelectElementIndex) {
      arrayForAllSelectRelatedElements[allSelectElementIndex].hide();
    }
    var radioSelectElementsCount = arrayForRadioElementSelectRelatedElements.length;
    for (var radioSelectElementIndex = 0; radioSelectElementIndex < radioSelectElementsCount; ++radioSelectElementIndex) {
      arrayForRadioElementSelectRelatedElements[radioSelectElementIndex].show();
    }
  };


  // it will disable the submission whenever there is a validation fails
  var defaultSubmitHandler = function(submitElement, readyToSubmit) {
    if (readyToSubmit) {
      submitElement.prop("disabled", false);
    } else {
      submitElement.prop("disabled", true);
    }
  };


  var EasyForm = function(options) {
    this.cache = {};

    options = options || {};
    this.validator = options.validator || {};   // "options.validator" extends "defaultValidator" and overrides same name validators in "defaultValidator".
    this.textValidHandler = options.textValidHandler || defaultValidHandler;
    this.textInvalidHandler = options.textInvalidHandler || defaultInvalidHandler;
    this.textDisplayHandler = options.textDisplayHandler || defaultTextDisplayHandler;
    this.radioSelectHandler = options.radioSelectHandler || defaultRadioSelectHandler;
    this.submitHandler = options.submitHandler || defaultSubmitHandler;
  };


  // cache elements parsing
  EasyForm.prototype._parseElements = function(inputElement, dataAttributeKey) {
    var dataAttributeValue = inputElement.data(dataAttributeKey);
    if (dataAttributeValue) {
      var cacheKey = dataAttributeKey + "=" + dataAttributeValue;
      var elements = this.cache[cacheKey];
      if (elements) {
        return elements;
      } else {
        var selectors = dataAttributeValue.split("|");
        elements = [];
        var count = selectors.length;
        for (var index = 0; index < count; ++index) {
          elements.push($(selectors[index]));
        }
        this.cache[cacheKey] = elements;
        return elements;
      }
    } else {
      return [];
    }
  };


  EasyForm.prototype._getSubmitRelatedInputs = function(submitSelector) {
    var relatedInputs = $("[data-submit~=" + submitSelector + "]");
    var sortedRelatedInputs = [];
    var relatedInputsCount = relatedInputs.length;
    for (var relatedInputIndex = 0; relatedInputIndex < relatedInputsCount; ++relatedInputIndex) {
      sortedRelatedInputs.push($(relatedInputs.get(relatedInputIndex)));
    }
    return sortedRelatedInputs;
  };


  EasyForm.prototype._validate = function(inputElement) {
    var inputValue = inputElement.val();

    var validatorDataAttributeValue = inputElement.data("validator");
    var validatorCacheKey = "validator=" + validatorDataAttributeValue;
    var validatorCache = this.cache[validatorCacheKey];

    // cache for validator parsing
    if (!validatorCache) {
      validatorCache = [];

      var validatorNames = validatorDataAttributeValue ? validatorDataAttributeValue.split("|") : [];
      var validatorNamesCount = validatorNames.length;

      if (validatorNamesCount > 0) {
        for (var validatorNameIndex = 0; validatorNameIndex < validatorNamesCount; ++validatorNameIndex) {
          var validatorName = validatorNames[validatorNameIndex];
          var parameters = [];
          var leftParenthesisPosition = validatorName.search("[(]");
          if (leftParenthesisPosition > 0) {
            parameters = validatorName.substring(leftParenthesisPosition + 1, validatorName.search("[)]")).split(",");
            validatorName = validatorName.substring(0, leftParenthesisPosition);
          }
          var validator = defaultValidator[validatorName];
          if (this.validator && this.validator[validatorName]) {
            validator = this.validator[validatorName];
          }
          validatorCache.push([validator, parameters, validatorName]);
        }
        this.cache[validatorCacheKey] = validatorCache;
      }

      this.cache[validatorCacheKey] = validatorCache;
    }

    var validatorCacheCount = validatorCache.length;
    if (validatorCacheCount > 0) {
      var validationResults = [];

      for (var validatorCacheIndex = 0; validatorCacheIndex < validatorCacheCount; ++validatorCacheIndex) {
        if (validatorCache[validatorCacheIndex][0]) {
          validationResults.push(validatorCache[validatorCacheIndex][0].apply(this, [inputValue].concat(validatorCache[validatorCacheIndex][1])));
        } else {
          validationResults.push(false);
          console.log("error: validator \"" + validatorCache[validatorCacheIndex][2] + "\" is not found.");
        }
      }

      // whenever there is a validation fails, input is not valid
      var inputValid = true;
      var validationCount = validationResults.length;
      for (var validationIndex = 0; validationIndex < validationCount; ++validationIndex) {
        if (validationResults[validationIndex] === false) {
          inputValid = false;
          break;
        }
      }
      this.setValidationResult(inputElement, inputValid);

      return validationResults;
    } else {
      return [];
    }
  };


  EasyForm.prototype.resetValidationResult = function(inputElement) {
    inputElement.data("valid", null);
  };


  EasyForm.prototype.setValidationResult = function(inputElement, validationResult) {
    inputElement.data("valid", validationResult);
  };


  EasyForm.prototype.getValidationResult = function(inputElement) {
    return inputElement.data("valid");
  };


  EasyForm.prototype.passValidation = function(inputElement) {
    var validationResult = inputElement.data("valid");
    if (validationResult && validationResult === true) {
      return true;
    } else {
      return false;
    }
  };


  EasyForm.prototype.onTextInput = function(event) {
    var inputElement = $(event.currentTarget);

    var validationResults = this._validate(inputElement);

    if (validationResults.length > 0) {
      // elements for showing validation success info
      var validInfoElements = this._parseElements(inputElement, "validInfo");
      this.textValidHandler(inputElement, validationResults, validInfoElements);

      // elements for showing validation error info
      var invalidInfoElements = this._parseElements(inputElement, "invalidInfo");
      this.textInvalidHandler(inputElement, validationResults, invalidInfoElements);
    }

    // elements for dynamically display inputted content
    var displayElements = this._parseElements(inputElement, "display");
    this.textDisplayHandler(inputElement, displayElements);
  };


  EasyForm.prototype.onRadioSelect = function(event) {
    var radioElement = $(event.currentTarget);
    var radioElementSelectRelatedElements = this._parseElements(radioElement, "selected");

    var radioNameAttributeValue = radioElement.attr("name");
    var radioCacheKey = "radio=[name~="+ radioNameAttributeValue + "]";
    var allSelectRelatedElements = this.cache[radioCacheKey];

    if (!allSelectRelatedElements) {
      allSelectRelatedElements = [];
      var allRelatedRadioElements = $("[name~=" + radioNameAttributeValue + "]");
      var radioCounts = allRelatedRadioElements.length;
      for (var radioIndex = 0; radioIndex < radioCounts; ++radioIndex) {
        var elements = this._parseElements($(allRelatedRadioElements.get(radioIndex)), "selected");
        var elementsCount = elements.length;
        for (var elementIndex = 0; elementIndex < elementsCount; ++elementIndex) {
          allSelectRelatedElements.push(elements[elementIndex]);
        }
      }
      this.cache[radioCacheKey] = allSelectRelatedElements;
    }

    this.radioSelectHandler(radioElement, radioElementSelectRelatedElements, allSelectRelatedElements);
  };


  EasyForm.prototype.isSubmittable = function(submitElement, displayValidationErrorForNotValidatedInputs, refreshSubmitCache, inputForSubmissionCheckDecider) {
    var submitSelector = submitElement.data("selfSelector");
    if (submitSelector) {
      var readyToSubmit = true;

      var submitCacheKey = "submitSelfSelector=" + submitSelector;
      var submitRelatedInputsCache = this.cache[submitCacheKey];
      if (!submitRelatedInputsCache || refreshSubmitCache) {
        submitRelatedInputsCache = this._getSubmitRelatedInputs(submitSelector);
        this.cache[submitCacheKey] = submitRelatedInputsCache;
      }

      var relatedInputsCount = submitRelatedInputsCache.length;
      for (var inputIndex = 0; inputIndex < relatedInputsCount; ++inputIndex) {
        var relatedInput = submitRelatedInputsCache[inputIndex];

        var considerThisRelatedInput = true;
        if (inputForSubmissionCheckDecider) {
          considerThisRelatedInput = inputForSubmissionCheckDecider(relatedInput);
        }

        if (considerThisRelatedInput) {
          var passValidation = this.getValidationResult(relatedInput);
          if (!passValidation) {
            if (passValidation !== false) {
              var relatedInputInvalidInfoElements = this._parseElements(relatedInput, "invalidInfo");
              var relatedInputValidationResults = this._validate(relatedInput);
              if (!this.passValidation(relatedInput)) {
                readyToSubmit = false;
                if (displayValidationErrorForNotValidatedInputs) {
                  this.textInvalidHandler(relatedInput, relatedInputValidationResults, relatedInputInvalidInfoElements);
                }
              }
            } else {
              readyToSubmit = false;
            }
          }
        }
      }

      return readyToSubmit;
    } else {
      console.log("error: no self selector is found for this submit element");
      return false;
    }
  };


  // refresh submission state, according to the current submittable status.
  EasyForm.prototype.refreshSubmit = function(submitElement, refreshSubmitCache, inputForSubmissionCheckDecider) {
    if (!this.validationDisabled(submitElement)) {
      this.submitHandler(submitElement, this.isSubmittable(submitElement, false, refreshSubmitCache, inputForSubmissionCheckDecider));
    }
  };


  // this will disable both the submission and the validation checks for related inputs
  EasyForm.prototype.disableSubmit = function(submitElement) {
    submitElement.prop("disabled", true);
    submitElement.data("validationDisabled", true);
  };


  // this will the validation checks for related inputs
  EasyForm.prototype.enableSubmit = function(submitElement, refreshSubmitCache) {
    submitElement.data("validationDisabled", false);
    this.refreshSubmit(submitElement, refreshSubmitCache);
  };


  EasyForm.prototype.validationDisabled = function(submitElement) {
    return submitElement.data("validationDisabled");
  };


  EasyForm.prototype.isEnterKey = function(event) {
    var keyCode = event.which || event.keyCode;
    if (keyCode === 13) {
      return true;
    } else {
      return false;
    }
  };


  return EasyForm;
});