modulejs.define("view/item/search", [
  "logger",
  "alerter",
  "backbone",
  "jquery",
  "jst",
  "cordova",
  "lib/easy_form",
  "app/cached_request",
  "app/constant",
  "app/navigator",
  "app/utility",
  "app/error_handler",
  "collection/item/search"
], function(logger, alerter, Backbone, $, JST, cordova, easyForm, cachedRequest, constant, navigator, utility, errorHandler, itemSearchCollection) {
  "use strict";


  var itemSearchView = Backbone.View.extend({
    initialize: function(options) {
      if (options.jsonParams.length < constant.MAX_URL_LENGTH) {
        this.searchOptions = JSON.parse(decodeURIComponent(options.jsonParams));
      } else {
        var errorMessage = "[view/item/search] - URL is too long.";
        logger(errorMessage);
        errorHandler(null, errorMessage);
      }

      this.formHelper = new easyForm();
    },


    // templates
    mainT: JST["template/item/search"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      var searchType = that.searchOptions.searchType || "new";

      switch(searchType) {
        case "name":
        case "barcode":
          cachedRequest.fetchCollection(itemSearchCollection, that.searchOptions, {
            success: function(searchedItems) {
              that.renderHelper(searchType, searchedItems);
            },

            error: function(collection, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/item/search] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
          break;
        case "new":
          that.renderHelper(searchType, null);
          break;
        default:
          that.$el.html(that.mainT({searchType: null, errorMessage: "Unrecognized Search Type"}));
      }

      return that;
    },


    renderHelper: function(searchType, searchedItems) {
      var that = this;

      that.$el.html(that.mainT({
        inCordova: constant.IN_CORDOVA,
        searchType: searchType,
        searchOptions: that.searchOptions,
        searchedItems: searchedItems,
        newItemCategory: constant.item.DEFAULT_PARENT_CATEGORY_ITEM_ID,
        pathToUrlTool: utility.pathToUrl,
        navigator: navigator
      }));
    },


    events: {
      "input #item-search-bc-input": "onBarcodeInput",
      "input #item-search-name-input": "onNameInput",
      "keyup #item-search-bc-input": "onBarcodeInputKeyup",
      "keyup #item-search-name-input": "onNameInputKeyup",
      "click #item-search-bc-submit": "searchBarcode",
      "click #item-search-name-submit": "searchName",
      "click #item-search-bc-scan-start": "startBarcodeScan"
    },


    onBarcodeInput: function(event) {
      this.formHelper.onTextInput(event);
      this.formHelper.refreshSubmit(this.$el.find("#item-search-bc-submit"));
    },


    onNameInput: function(event) {
      this.formHelper.onTextInput(event);
      this.formHelper.refreshSubmit(this.$el.find("#item-search-name-submit"));
    },


    onBarcodeInputKeyup: function(event) {
      if (this.formHelper.isEnterKey(event)) {
        this.$el.find("#item-search-bc-submit").trigger("click");
      }
    },


    onNameInputKeyup: function(event) {
      if (this.formHelper.isEnterKey(event)) {
        this.$el.find("#item-search-name-submit").trigger("click");
      }
    },


    searchBarcode: function() {
      var submitButton = this.$el.find("#item-search-bc-submit");
      if (this.formHelper.isSubmittable(submitButton, true)) {
        // prevent multiple triggering
        submitButton.html("Submitting ...");
        this.formHelper.disableSubmit(submitButton);
        this.formHelper.disableSubmit(this.$el.find("#item-search-name-submit"));
      }

      var searchOptions = {};
      searchOptions.searchType = "barcode";
      searchOptions.barcode = this.$el.find("#item-search-bc-input").val();
      navigator.itemSearch(JSON.stringify(searchOptions));
    },


    searchName: function() {
      var submitButton = this.$el.find("#item-search-name-submit");
      if (this.formHelper.isSubmittable(submitButton, true)) {
        // prevent multiple triggering
        submitButton.html("Submitting ...");
        this.formHelper.disableSubmit(submitButton);
        this.formHelper.disableSubmit(this.$el.find("#item-search-bc-submit"));
      }

      var searchOptions = {};
      searchOptions.searchType = "name";
      searchOptions.name = this.$el.find("#item-search-name-input").val();
      navigator.itemSearch(JSON.stringify(searchOptions));
    },


    startBarcodeScan: function() {
      if (cordova) {
        var that = this;

        cordova.exec(
          function(resultArray) {
            var barcodeInput = that.$el.find("#item-search-bc-input");
            barcodeInput.val(resultArray[0]);
            barcodeInput.trigger("input");
          },

          function(error) {
            var errorMessage = ["Scan Failed: ", error].join("");
            logger(errorMessage);
            alerter(errorMessage);
          },

          "ScanditSDK",
          "scan",
          [
            "V+BVC80ojNDttpE+Z4cfN51N5LCBVoW47EaZIBH4rIo",
            {
                "beep": false,
                "vibrate": true,
                "code128": false,
                "dataMatrix": false,
                "disableStandbyState": true
            }
          ]
        );
      } else {
        // should never get here.
        var errorMessage = "[view/item/search] - Cordova not found.";
        logger(errorMessage);
        errorHandler(null, errorMessage);
      }
    }
  });


  return itemSearchView;
});