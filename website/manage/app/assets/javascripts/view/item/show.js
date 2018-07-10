modulejs.define("view/item/show", [
  "confirmer",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/cached_request",
  "app/cookie",
  "app/navigator",
  "app/utility",
  "app/error_handler",
  "model/item",
  "model/feed_mapping",
  "collection/store_item_info/by_item",
  "collection/feed_mapping/index",
  "model/item_image"
], function(confirmer, logger, Backbone, $, JST, cachedRequest, cookie, navigator, utility,
  errorHandler, itemModel, feedmappingModel, storeiteminfoByitemCollection, feedmappingIndexCollection,
  itemImageModel
) {
  "use strict";


  var itemShowView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id;
    },


    mainT: JST["template/item/show/main"],
    feedMappingT: JST["template/item/show/_feed_mapping"],
    loadingT: JST["template/main/loading"],
    categoryPathT: JST["template/item/_category_path"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      cachedRequest.fetchModel(itemModel, that.id, {
        success: function(fetchedItem) {

          cachedRequest.fetchCollection(storeiteminfoByitemCollection, {itemId: (fetchedItem.id || "")}, {
            success: function(fetchedInfos) {
              // put the selected store item info first to display
              var allInfoArray = fetchedInfos.models;
              var selectedStoreId = cookie.getSelectedStoreId();
              if (selectedStoreId) {
                selectedStoreId = selectedStoreId.toString();
                var infoCount = allInfoArray.length;
                if (infoCount > 1) {
                  for (var infoIndex = 1; infoIndex < infoCount; ++infoIndex) {
                    if (allInfoArray[infoIndex].get("store_id").toString() === selectedStoreId) {
                      var tmp = allInfoArray[0];
                      allInfoArray[0] = allInfoArray[infoIndex];
                      allInfoArray[infoIndex] = tmp;
                      break;
                    }
                  }
                }
              }

              that.$el.html(that.mainT({
                item: fetchedItem,
                storeItemInfos: allInfoArray,
                selectedStoreId: selectedStoreId,
                categoryPathTemplate: that.categoryPathT,
                pathToUrlTool: utility.pathToUrl,
                navigator: navigator
              }));

              fetchedInfos.each(function(info) {
                that.refreshFeedMappings(info.id, info.get("feed_mappings"));
              });
            },

            error: function(collection, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/item/show] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/item/show] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });

      return that;
    },


    refreshFeedMappings: function(storeItemInfoId, feedMappings) {
      var that = this;

      var feedMappingsContainer = this.$(["#item-show-sii-", storeItemInfoId, "-fm-container"].join(""));
      feedMappingsContainer.find(".item-show-sii-fm-edit-form").form("destroy");
      feedMappingsContainer.empty();
      feedMappingsContainer.html(this.feedMappingT({storeItemInfoId: storeItemInfoId, feedMappings: feedMappings, utility: utility}));

      feedMappingsContainer.find(".item-show-sii-fm-edit-form").form({
        fields: {
          instacart_id: "empty"
        },

        onSuccess: function(event) {
          event.preventDefault();
          var form = $(event.currentTarget);
          form.addClass("loading");
          var feedMappingData = form.form("get values");
          feedMappingData.instacart_id = (feedMappingData.instacart_id || "").trim();
          cachedRequest.saveModel(feedmappingModel, feedMappingData, {
            success: function(savedFeedMapping) {
              var storeItemInfoId = savedFeedMapping.get("store_item_info_id");
              cachedRequest.fetchCollection(feedmappingIndexCollection, {storeItemInfoId: storeItemInfoId}, {
                success: function(fetchedCollection) {
                  that.refreshFeedMappings(storeItemInfoId, fetchedCollection.models);
                },

                error: function(collection, jqXHR) {
                  logger(jqXHR);
                  errorHandler(jqXHR.responseJSON.error_code, ["[view/item/show] - ", jqXHR.responseJSON.error_message].join(""));
                }
              });
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/item/show] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });

          return false;
        }
      });
    },


    events: {
      "click .item-show-sii-fm-edit-delete": "deleteFeedMapping",
      "click .item-show-sii-fm-edit-start": "showFeedMappingEditForm",
      "click .item-show-sii-fm-edit-cancel": "hideFeedMappingEditForm",
      "click .item-show-edit-image-viewable": "editItemImage",
      "click .item-show-edit-image-viewable-cancel": "cancelImageViewable",
      "click .item-show-edit-image-viewable-save": "saveImageViewable"
    },

    editItemImage: function(event) {

      var cancelButton = $(event.currentTarget);
      var imageId = cancelButton.data("image-id");
      $(["#item-show-edit-image-", imageId, "-viewable-block"].join("")).show();

    },

    cancelImageViewable: function(event) {
      var cancelButton = $(event.currentTarget);
      var imageId = cancelButton.data("image-id");

      $(["#item-show-edit-image-", imageId, "-viewable-block"].join("")).hide();

    },

    saveImageViewable: function(event) {
      var that = this;
      var saveButton = $(event.currentTarget);
      var imageId = saveButton.data("image-id");

      var isViewable = false;

      var selected = $(['input[name = "image-', imageId, '-viewable"]:checked'].join("")).val();

      if (selected === 'viewable') {
        isViewable = true;
      } else {
        isViewable = false;
      }

      var itemData = {
        id: imageId,
        customer_viewable: isViewable
      };

      cachedRequest.saveModel(itemImageModel, itemData, {
        success: function(savedModel) {
          that.$(["#item-show-edit-image-", imageId, "-viewable-block"].join("")).hide();

          that.$(["#item-show-item-", imageId, "-is-viewable"].join("")).html(selected);

          if (isViewable === true) {
            that.$(["#item-show-item-", imageId, "-is-viewable"].join("")).removeClass('haigy-font-color-orange');
            that.$(["#item-show-item-", imageId, "-is-viewable"].join("")).addClass('haigy-font-color-green');
          }
          else {
            that.$(["#item-show-item-", imageId, "-is-viewable"].join("")).removeClass('haigy-font-color-green');
            that.$(["#item-show-item-", imageId, "-is-viewable"].join("")).addClass('haigy-font-color-orange');
          }
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/item/show] - ", jqXHR.responseJSON.error_message].join(""));
        }

      });


    },

    deleteFeedMapping: function(event) {
      event.preventDefault();

      var that = this;
      confirmer("Are you sure?", function() {
        var element = $(event.currentTarget);
        element.blur();
        var feedMappingId = element.data("feedMappingId");
        var storeItemInfoId = element.data("storeItemInfoId");
        that.$(["#item-show-sii-", storeItemInfoId, "-fm-", feedMappingId, "-edit-form"].join("")).addClass("loading");

        cachedRequest.destroyModel(feedmappingModel, feedMappingId, {
          success: function(deletedFeedMapping) {
            var storeItemInfoId = deletedFeedMapping.get("store_item_info_id");
            cachedRequest.fetchCollection(feedmappingIndexCollection, {storeItemInfoId: storeItemInfoId}, {
              success: function(fetchedCollection) {
                that.refreshFeedMappings(storeItemInfoId, fetchedCollection.models);
              },

              error: function(collection, jqXHR) {
                logger(jqXHR);
                errorHandler(jqXHR.responseJSON.error_code, ["[view/item/show] - ", jqXHR.responseJSON.error_message].join(""));
              }
            });
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/item/show] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }).open();
    },


    showFeedMappingEditForm: function(event) {
      event.preventDefault();
      var element = $(event.currentTarget);
      element.blur();
      var storeItemInfoId = element.data("storeItemInfoId");
      var feedMappingId = element.data("feedMappingId");
      this.$(["#item-show-sii-", storeItemInfoId, "-fm-", feedMappingId].join("")).hide();
      this.$(["#item-show-sii-", storeItemInfoId, "-fm-", feedMappingId, "-edit-container"].join("")).show();
    },


    hideFeedMappingEditForm: function(event) {
      event.preventDefault();
      var element = $(event.currentTarget);
      element.blur();
      var storeItemInfoId = element.data("storeItemInfoId");
      var feedMappingId = element.data("feedMappingId");
      this.$(["#item-show-sii-", storeItemInfoId, "-fm-", feedMappingId, "-edit-container"].join("")).hide();
      this.$(["#item-show-sii-", storeItemInfoId, "-fm-", feedMappingId].join("")).show();
    },


    remove: function() {
      this.$(".item-show-sii-fm-edit-form").form("destroy");
      Backbone.View.prototype.remove.call(this);
    }
  });


  return itemShowView;
});
