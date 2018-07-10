modulejs.define("view/item/edit_category", [
  "confirmer",
  "formdata",
  "logger",
  "alerter",
  "backbone",
  "jquery",
  "jst",
  "lib/easy_form",
  "app/cached_request",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "app/utility",
  "model/item",
  "collection/item/manage"
], function(confirmer, FormData, logger, alerter, Backbone, $, JST, easyForm, cachedRequest, constant, navigator, errorHandler, utility, itemModel, itemManageCollection) {
  "use strict";


  var itemEditcategoryView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id;
      this.parentId = options.parentCategoryItemId;

      this.formHelper = new easyForm();
    },


    mainT: JST["template/item/edit_category"],
    loadingT: JST["template/main/loading"],
    categoryPathT: JST["template/item/_category_path"],


    render: function() {
      var that = this;

      if (that.id) {
        that.$el.html(that.loadingT());

        cachedRequest.fetchModel(itemModel, that.id, {
          success: function(fetchedItem) {
            that.$el.html(that.mainT({
              categoryNew: false,
              category: fetchedItem,
              categoryPathTemplate: that.categoryPathT,
              pathToUrlTool: utility.pathToUrl,
              navigator: navigator
            }));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/item/edit_category] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      } else {
        var category = new itemModel();

        if (parseInt(that.parentId) === constant.item.ROOT_PARENT_CATEGORY_ITEM_ID) {
          that.$el.html(that.mainT({
            categoryNew: true,
            category: category,
            parentCategory: null,
            navigator: navigator
          }));
        } else {
          that.$el.html(that.loadingT());

          cachedRequest.fetchModel(itemModel, that.parentId, {
            success: function(fetchedItem) {
              that.$el.html(that.mainT({
                categoryNew: true,
                category: category,
                parentCategory: fetchedItem,
                categoryPathTemplate: that.categoryPathT,
                pathToUrlTool: utility.pathToUrl,
                navigator: navigator
              }));
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/item/edit_category] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
        }
      }

      return that;
    },


    events: {
      "input #item-editcategory-name,#item-editcategory-keywords,#item-editcategory-display-sequence,#item-editcategory-temporary-cover": "onInput",
      "change #item-editcategory-cover-image,#item-editcategory-temporary-cover": "onInput",
      "blur #item-editcategory-name,#item-editcategory-keywords": "onInput",
      "keyup #item-editcategory-display-sequence,#item-editcategory-name,#item-editcategory-keywords": "onKeyUp",
      "click #item-editcategory-submit": "onSubmit",
      "click #item-editcategory-delete": "onDelete"
    },


    onInput: function(event) {
      this.formHelper.onTextInput(event);
      this.formHelper.refreshSubmit(this.$el.find("#item-editcategory-submit"));
    },


    onKeyUp: function(event) {
      if (this.formHelper.isEnterKey(event)) {
        this.$el.find("#item-editcategory-submit").trigger("click");
      }
    },


    onSubmit: function(event) {
      var submitButton = $(event.currentTarget);
      if (this.formHelper.isSubmittable(submitButton, true)) {
        // prevent multiple triggering
        submitButton.html("Submitting ...");
        this.formHelper.disableSubmit(submitButton);

        var formData = new FormData();

        formData.append("item[name]", this.$("#item-editcategory-name").val().trim());
        formData.append("item[item_keywords]", this.$("#item-editcategory-keywords").val().trim().toLowerCase());

        var displaySequence = parseInt(this.$("#item-editcategory-display-sequence").val());
        if (isNaN(displaySequence)) {
          displaySequence = 0;
        }
        formData.append("item[display_sequence]", displaySequence);

        var image = this.$el.find("#item-editcategory-cover-image").get(0).files[0];
        if (image) {
          formData.append("item[cover_image]", image);
        }
        formData.append("item[is_category]", true);

        formData.append("item[temporary_cover_image]", this.$("#item-editcategory-temporary-cover").is(":checked"));

        if (!this.id) {
          formData.append("item[parent_category_item_id]", this.parentId);
        }

        cachedRequest.saveModelByMultipart(itemModel, this.id, formData, {
          success: function(savedModel) {
            navigator.itemManage(savedModel.get("parent_category_item_id"));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/item/edit_category] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }
    },


    onDelete: function(event) {
      event.preventDefault();

      var that = this;
      confirmer("Are you sure to delete this category?", function() {
        cachedRequest.fetchCollection(itemManageCollection, {parentCategoryItemId: that.id}, {
          success: function(fetchedItems) {
            if (fetchedItems.length > 0) {
              alerter("Cannot remove this category because it is not empty.");
            } else {
              cachedRequest.destroyModel(itemModel, that.id, {
                success: function(destroyedModel) {
                  navigator.itemManage(destroyedModel.get("parent_category_item_id"));
                },

                error: function(model, jqXHR) {
                  logger(jqXHR);
                  errorHandler(jqXHR.responseJSON.error_code, ["[view/company/edit_category] - ", jqXHR.responseJSON.error_message].join(""));
                }
              });
            }
          },

          error: function(collection, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/item/edit_category] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }).open();
    }
  });


  return itemEditcategoryView;
});
