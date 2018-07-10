modulejs.define("view/feed/instacart", [
  "alerter",
  "confirmer",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "model/feed",
  "collection/feed/instacart"
], function(alerter, confirmer, logger, Backbone, $, JST, constant, cachedRequest, navigator, errorHandler, feedModel, feedInstacartCollection) {
  "use strict";


  var feedInstacartView = Backbone.View.extend({
    mainT: JST["template/feed/instacart"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchCollection(feedInstacartCollection, {}, {
        success: function(fetchedCollection) {
          that.$el.html(that.mainT({allFeeds: fetchedCollection, constant: constant}));

          that.$(".feed-instacart-feed-edit-form").form({
            fields: {
              name: "empty",
              source: "empty"
            },

            onSuccess: function(event) {
              event.preventDefault();
              var form = $(event.currentTarget);
              form.addClass("loading");
              var feedData = form.form("get values");
              cachedRequest.saveModel(feedModel, feedData, {
                success: function() {
                  navigator.refresh();
                },

                error: function(model, jqXHR) {
                  logger(jqXHR);
                  errorHandler(jqXHR.responseJSON.error_code, ["[view/feed/instacart] - ", jqXHR.responseJSON.error_message].join(""));
                }
              });

              return false;
            }
          });

          that.$(".feed-instacart-feeding-form").form({
            fields: {
              feeding_data: "empty"
            },

            onSuccess: function(event) {
              event.preventDefault();
              var form = $(event.currentTarget);
              form.addClass("loading");

              var formData = form.form("get values");

              // legacy html parser
              // var html = null;
              // try {
              //   html = $(formData.feeding_data);
              // } catch (error) {
              //   alerter(error.message);
              //   form.removeClass("loading");
              //   return;
              // }
              //
              // var allItemContainers = html.find("li.item.has-details");
              // var feedingData = {};
              //
              // allItemContainers.each(function() {
              //   var itemContainer = $(this);
              //   var instacartId = itemContainer.data("itemId");
              //   var itemPriceContainer = itemContainer.find(".item-price");
              //   var itemFullPriceContainer = itemPriceContainer.find(".item-full-price");
              //   if (itemFullPriceContainer.length > 0) {
              //     var fullPrice = itemFullPriceContainer.text().replace(/\$/g, "");
              //     itemFullPriceContainer.remove();
              //     feedingData[instacartId] = {
              //       sale_price: itemPriceContainer.text().replace(/\$/g, ""),
              //       price: fullPrice
              //     };
              //   } else {
              //     feedingData[instacartId] = {
              //       price: itemPriceContainer.text().replace(/\$/g, "")
              //     };
              //   }
              // });

              var feedingData = {};
              var jsonData = null;
              try {
                jsonData = JSON.parse(formData.feeding_data);
              } catch (error) {
                alerter(error.message);
                form.removeClass("loading");
                return;
              }

              var itemDataList = null;
              var pagination = null;
              var aisle = null;
              if (jsonData.module_data) {
                jsonData = jsonData.module_data;
                var jsonDataKeys = Object.keys(jsonData);
                var jsonDataKeyCount = jsonDataKeys.length;
                for (var keyIndex = 0; keyIndex < jsonDataKeyCount; ++keyIndex) {
                  var data = jsonData[jsonDataKeys[keyIndex]];
                  if (data.items) {
                    aisle = jsonDataKeys[keyIndex];
                    itemDataList = data.items;
                    pagination = data.pagination;
                  }
                }
              }

              if (itemDataList && pagination) {
                if (pagination.next_page) {
                  logger(["There are more pages for ", aisle, ". This is page ", pagination.page, " (", pagination.per_page, " per page). There should be total ", pagination.total, " in this aisle."].join(""));
                } else {
                  logger(["This is the last page for ", aisle, ". This is page ", pagination.page, " (", pagination.per_page, " per page). There should be total ", pagination.total, " in this aisle."].join(""));
                  logger("----------");
                }

                var itemCount = itemDataList.length;
                for (var itemIndex = 0; itemIndex < itemCount; ++itemIndex) {
                  var itemData = itemDataList[itemIndex];

                  var itemAvailable = false;
                  var itemAttributes = itemData.attributes;
                  if (itemAttributes && itemAttributes.length) {
                    var itemAttributeCount = itemAttributes.length;
                    for (var itemAttributeIndex = 0; itemAttributeIndex < itemAttributeCount; ++itemAttributeIndex) {
                      if (itemAttributes[itemAttributeIndex] === "available") {
                        itemAvailable = true;
                        break;
                      }
                    }
                  }

                  if (itemAvailable) {
                    if (itemData.legacy_id && itemData.pricing && itemData.pricing.price) {
                      feedingData[itemData.legacy_id] = {
                        price: itemData.pricing.price.replace(/\$/g, "")
                      };
                    } else {
                      alerter("Item info parse error. Instacart might have changed APIs.");
                      form.removeClass("loading");
                      return;
                    }
                  }
                }
              } else {
                alerter("Parsing error. Instacart may have changed APIs.");
              }

              formData.feeding_data = feedingData;
              // logger(feedingData);

              if (Object.keys(feedingData).length > 0) {
                cachedRequest.saveModel(feedModel, formData, {
                  success: function() {
                    navigator.refresh();
                  },

                  error: function(model, jqXHR) {
                    logger(jqXHR);
                    errorHandler(jqXHR.responseJSON.error_code, ["[view/feed/instacart] - ", jqXHR.responseJSON.error_message].join(""));
                  }
                });
              } else {
                alerter("No data is parsed. Instacart might have changed APIs.");
                form.removeClass("loading");
              }

              return false;
            }
          });
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/feed/instacart] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    events: {
      "click .feed-instacart-refresh-page": "refreshPage",
      "click .feed-instacart-feed-edit": "showFeedEditForm",
      "click .feed-instacart-feed-edit-form-cancel": "hideFeedEditForm",
      "click .feed-instacart-start-feeding": "showFeedingForm",
      "click .feed-instacart-cancel-feeding": "hideFeedingForm",
      "click #feed-instacart-new-feed": "showNewFeedForm",
      "click #feed-instacart-new-feed-form-cancel": "hideNewFeedForm",
      "click .feed-instacart-feed-delete": "deleteFeed"
    },


    refreshPage: function(event) {
      event.preventDefault();
      navigator.refresh();
    },


    showFeedEditForm: function(event) {
      event.preventDefault();
      var element = $(event.currentTarget);
      element.blur();
      var feedId = element.data("feedId");
      this.$(["#feed-instacart-feed-", feedId, "-show-container"].join("")).hide();
      this.$(["#feed-instacart-feed-", feedId, "-edit-container"].join("")).show();
    },


    hideFeedEditForm: function(event) {
      event.preventDefault();
      var element = $(event.currentTarget);
      element.blur();
      var feedId = element.data("feedId");
      this.$(["#feed-instacart-feed-", feedId, "-edit-container"].join("")).hide();
      this.$(["#feed-instacart-feed-", feedId, "-show-container"].join("")).show();
    },


    showFeedingForm: function(event) {
      event.preventDefault();
      var element = $(event.currentTarget);
      element.blur();
      var feedId = element.data("feedId");
      this.$(["#feed-instacart-feed-", feedId, "-start-feeding-button"].join("")).hide();
      this.$(["#feed-instacart-feed-", feedId, "-feeding-form-container"].join("")).show();
    },


    hideFeedingForm: function(event) {
      event.preventDefault();
      var element = $(event.currentTarget);
      element.blur();
      var feedId = element.data("feedId");
      this.$(["#feed-instacart-feed-", feedId, "-feeding-form-container"].join("")).hide();
      this.$(["#feed-instacart-feed-", feedId, "-start-feeding-button"].join("")).show();
    },


    showNewFeedForm: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();
      $("#feed-instacart-new-feed-form").show();
    },


    hideNewFeedForm: function(event) {
      event.preventDefault();
      $(event.currentTarget).blur();
      $("#feed-instacart-new-feed-form").hide();
    },


    deleteFeed: function(event) {
      event.preventDefault();

      var that = this;
      confirmer("Are you sure?", function() {
        var element = $(event.currentTarget);
        element.blur();
        var feedId = element.data("feedId");
        that.$(["#feed-instacart-feed-", feedId, "-edit-form"].join("")).addClass("loading");

        cachedRequest.destroyModel(feedModel, feedId, {
          success: function() {
            navigator.refresh();
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/feed/instacart] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }).open();
    },


    remove: function() {
      this.$(".feed-instacart-feed-edit-form").form("destroy");
      Backbone.View.prototype.remove.call(this);
    }
  });


  return feedInstacartView;
});
