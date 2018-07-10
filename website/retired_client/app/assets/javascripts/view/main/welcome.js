modulejs.define("view/main/welcome", [
  "alerter",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/navigator",
  "app/utility",
  "app/cookie",
  "app/precompiled_asset",
  "app/cached_request",
  "app/analytics",
  "app/error_handler",
  "collection/brief_info_item/marketing",
  "collection/user_address/change_zip_code"
], function(alerter, logger, Backbone, $, JST, constant, navigator, utility, cookie, precompiledAsset, cachedRequest,
  analytics, errorHandler, briefinfoitemMarketingCollection, useraddressChangezipcodeCollection
) {
  "use strict";


  var mainWelcomeView = Backbone.View.extend({
    initialize: function(options) {
      this.zipCode = options.zipCode;
    },


    mainT: JST["template/main/welcome/main"],
    marketingT: JST["template/main/welcome/_marketing"],


    render: function() {
      this.$el.html(this.mainT({zipCode: this.zipCode}));
      this.$("#main-welcome-update-zip-code").hide();
      this.renderMarketingContent(this.zipCode);

      return this;
    },


    renderMarketingContent: function(zipCode) {
      var that = this;

      var marketingContainer = that.$("#main-welcome-marketing-container");
      marketingContainer.css("min-height", marketingContainer.height());
      marketingContainer.empty();
      marketingContainer.append("<div class='ui active centered inline text loader'>Loading</div>");

      cachedRequest.fetchCollection(briefinfoitemMarketingCollection, {zipCode: zipCode}, {
        success: function(fetchedItems) {
          marketingContainer.empty();
          marketingContainer.html(that.marketingT({
            allItems: fetchedItems,
            zipCode: zipCode,
            constant: constant,
            utility: utility,
            precompiledAsset: precompiledAsset
          }));
          marketingContainer.css("min-height", 0);
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(["[view/main/welcome] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });
    },


    events: {
      "input #main-welcome-zip-code-input": "onZipCodeInput",
      "keydown #main-welcome-zip-code-input": "onZipCodeKeydown",
      "click #main-welcome-update-zip-code": "updateZipCode",
      "click .main-welcome-see-item-details": "startShopping",
      "click #main-welcome-view-more-items": "startShopping"
    },


    onZipCodeInput: function(event) {
      var inputElement = $(event.currentTarget);
      if (inputElement.val().trim() === inputElement.data("zipCode").toString()) {
        this.$("#main-welcome-update-zip-code").hide();
      } else {
        this.$("#main-welcome-update-zip-code").show();
      }
    },


    onZipCodeKeydown: function(event) {
      var inputElement = $(event.currentTarget);
      var keyCode = event.which;
      switch(keyCode) {
        case 13:   // key: enter
          this.updateZipCode();
          return;
        case 27:   // key: esc
          inputElement.val(inputElement.data("zipCode"));
          this.$("#main-welcome-update-zip-code").hide();
          return;
      }
    },


    getNormalizedZipCode: function(zipCode) {
      var normalizedZipCode = parseInt(zipCode);
      if (isNaN(normalizedZipCode)) {
        normalizedZipCode = "00000";
      }
      normalizedZipCode = normalizedZipCode.toString().substring(0, 5);
      var tmpArray = [];
      for (var index = normalizedZipCode.length; index < 5; ++index) {
        tmpArray.push("0");
      }
      tmpArray.push(normalizedZipCode);
      normalizedZipCode = tmpArray.join("");
      return normalizedZipCode;
    },


    updateZipCode: function(event) {
      if (event) {
        event.preventDefault();
        $(event.currentTarget).blur();
      }
      var zipCodeInput = $("#main-welcome-zip-code-input");
      var newZipCode = zipCodeInput.val();
      var oldZipCode = zipCodeInput.data("zipCode").toString();
      if (newZipCode !== oldZipCode) {
        this.$("#main-welcome-update-zip-code").hide();
        newZipCode = this.getNormalizedZipCode(newZipCode);
        zipCodeInput.data("zipCode", newZipCode);
        zipCodeInput.val(newZipCode);
        this.renderMarketingContent(newZipCode);
        navigator.mainWelcome(newZipCode, {trigger: false, replace: true});
      }
    },


    startShopping: function(event) {
      event.preventDefault();
      var element = $(event.currentTarget);
      element.blur();

      var oldZipCode = cookie.user.getZipCode();
      var newZipCode = this.getNormalizedZipCode(element.data("zipCode"));

      if (newZipCode !== oldZipCode) {
        analytics.trialWithZipCode(newZipCode);

        cachedRequest.fetchCollection(useraddressChangezipcodeCollection, {}, {
          type: "POST",

          data: {
            old_zip_code: "",
            new_zip_code: newZipCode
          },

          success: function(fetchedCollection) {
            cookie.initializeCookie(constant.session.GUEST_TOKEN, fetchedCollection.getServiceAreaId(), newZipCode);
            var itemId = element.data("itemId");
            if (itemId && itemId.toString().length > 0) {
              navigator.detailedinfoitemShow(itemId);
            } else {
              navigator.mainHome();
            }
            if (!cookie.user.isServableArea()) {
              alerter(constant.text.NO_SERVICE_WARNING);
            }
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(["[view/main/welcome] - ", jqXHR.responseJSON.error_message].join(""));
          }
        }, true);
      } else {
        var itemId = element.data("itemId");
        if (itemId && itemId.toString().length > 0) {
          navigator.detailedinfoitemShow(itemId);
        } else {
          navigator.mainHome();
        }
      }
    },


    remove: function() {
      Backbone.View.prototype.remove.call(this);
    }
  });


  return mainWelcomeView;
});