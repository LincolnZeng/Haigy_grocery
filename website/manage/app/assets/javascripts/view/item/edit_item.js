modulejs.define("view/item/edit_item", [
  "confirmer",
  "formdata",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "cordova",
  "lib/easy_form",
  "app/cached_request",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "app/utility",
  "model/item"
], function(confirmer, FormData, logger, Backbone, $, JST, cordova, easyForm, cachedRequest, constant, navigator, errorHandler, utility, itemModel) {
  "use strict";


  var itemEdititemView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id;
      this.parentId = options.parentCategoryItemId || constant.item.DEFAULT_PARENT_CATEGORY_ITEM_ID;

      this.formHelper = new easyForm();
    },


    mainT: JST["template/item/edit_item"],
    loadingT: JST["template/main/loading"],
    categoryPathT: JST["template/item/_category_path"],


    render: function() {
      var that = this;

      var inCordova = constant.IN_CORDOVA;

      if (that.id) {
        that.$el.html(that.loadingT());

        cachedRequest.fetchModel(itemModel, that.id, {
          success: function(fetchedItem) {
            that.$el.html(that.mainT({
              itemNew: false,
              item: fetchedItem,
              inCordova: inCordova,
              categoryPathTemplate: that.categoryPathT,
              pathToUrlTool: utility.pathToUrl,
              navigator: navigator,
              constant: constant
            }));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/item/edit_item] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      } else {
        var item = new itemModel();

        var parentCategoryId = parseInt(that.parentId);

        if (parentCategoryId === constant.item.ROOT_PARENT_CATEGORY_ITEM_ID || parentCategoryId === constant.item.DEFAULT_PARENT_CATEGORY_ITEM_ID) {
          that.$el.html(that.mainT({itemNew: true, item: item, inCordova: inCordova, parentCategory: null, navigator: navigator}));
        } else {
          that.$el.html(that.loadingT());

          cachedRequest.fetchModel(itemModel, that.parentId, {
            success: function(fetchedItem) {
              that.$el.html(that.mainT({
                itemNew: true,
                item: item,
                parentCategory: fetchedItem,
                inCordova: inCordova,
                categoryPathTemplate: that.categoryPathT,
                pathToUrlTool: utility.pathToUrl,
                navigator: navigator,
                constant: constant
              }));
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/item/edit_item] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
        }
      }

      return that;
    },


    events: {
      "input #item-edititem-name,#item-edititem-keywords,#item-edititem-display-sequence,#item-edititem-size,#item-edititem-barcode,#item-edititem-barcode-type": "onInput",
      "input #item-edititem-brand,#item-edititem-manufacturer,#item-edititem-details,#item-edititem-ingredients,#item-edititem-warnings,#item-edititem-directions": "onInput",
      "blur #item-edititem-name": "onInput",
      "change #item-edititem-cover-image,#item-edititem-temporary-cover,#item-edititem-unit,#item-edititem-other-image": "onInput",
      "change #item-edititem-is-organic,#item-edititem-is-kosher,#item-edititem-is-vegan,#item-edititem-is-gluten-free,#item-edititem-is-produce,#item-edititem-is-seasonal": "onInput",
      "change #item-edititem-is-dairy-free,#item-edititem-is-egg-free,#item-edititem-is-lactose-free": "onInput",
      "keyup #item-edititem-display-sequence,#item-edititem-name,#item-edititem-keywords,#item-edititem-size,#item-edititem-barcode,#item-edititem-barcode-type,#item-edititem-brand,#item-edititem-manufacturer": "onKeyUp",
      "click #item-edititem-submit": "onSubmit",
      "click #item-edititem-delete": "onDelete",
      "click .item-edititem-delete-barcode,.item-edititem-delete-image": "deleteBarcodeOrImage",
      "click #item-edititem-barcode-scan": "startBarcodeScan"
    },


    onInput: function(event) {
      this.formHelper.onTextInput(event);
      this.formHelper.refreshSubmit(this.$el.find("#item-edititem-submit"));
    },


    onKeyUp: function(event) {
      if (this.formHelper.isEnterKey(event)) {
        this.$el.find("#item-edititem-submit").trigger("click");
      }
    },


    onSubmit: function(event) {
      var submitButton = $(event.currentTarget);
      if (this.formHelper.isSubmittable(submitButton, true)) {
        // prevent multiple triggering
        submitButton.html("Submitting ...");
        this.formHelper.disableSubmit(submitButton);

        var formData = new FormData();

        formData.append("item[name]", this.$el.find("#item-edititem-name").val().trim());
        formData.append("item[item_keywords]", this.$el.find("#item-edititem-keywords").val().trim().toLowerCase());

        var displaySequence = parseInt(this.$("#item-edititem-display-sequence").val());
        if (isNaN(displaySequence)) {
          displaySequence = 0;
        }
        formData.append("item[display_sequence]", displaySequence);

        var image = this.$el.find("#item-edititem-cover-image").get(0).files[0];
        if (image) {
          formData.append("item[cover_image]", image);
        }
        formData.append("item[is_category]", false);
        formData.append("item[temporary_cover_image]", this.$("#item-edititem-temporary-cover").is(":checked"));
        formData.append("item[unit]", this.$("#item-edititem-unit").val());
        formData.append("item[item_size]", this.$("#item-edititem-size").val().trim());
        formData.append("item[is_organic]", this.$("#item-edititem-is-organic").is(":checked"));
        formData.append("item[is_kosher]", this.$("#item-edititem-is-kosher").is(":checked"));
        formData.append("item[is_vegan]", this.$("#item-edititem-is-vegan").is(":checked"));
        formData.append("item[is_gluten_free]", this.$("#item-edititem-is-gluten-free").is(":checked"));
        formData.append("item[is_dairy_free]", this.$("#item-edititem-is-dairy-free").is(":checked"));
        formData.append("item[is_egg_free]", this.$("#item-edititem-is-egg-free").is(":checked"));
        formData.append("item[is_lactose_free]", this.$("#item-edititem-is-lactose-free").is(":checked"));
        formData.append("item[is_produce]", this.$("#item-edititem-is-produce").is(":checked"));
        formData.append("item[is_seasonal]", this.$("#item-edititem-is-seasonal").is(":checked"));

        var barcode = this.$el.find("#item-edititem-barcode").val().trim();
        if (barcode.length > 0) {
          formData.append("item[barcode]", barcode);
        }
        var barcodeType = this.$el.find("#item-edititem-barcode-type").val().trim();
        if (barcodeType.length > 0) {
          formData.append("item[barcode_type]", barcodeType);
        }

        var brand = this.$el.find("#item-edititem-brand").val().trim();
        if (brand.length > 0) {
          formData.append("item[brand]", brand);
        }

        var manufacturer = this.$el.find("#item-edititem-manufacturer").val().trim();
        if (manufacturer.length > 0) {
          formData.append("item[manufacturer]", manufacturer);
        }

        var details = this.$el.find("#item-edititem-details").val().trim();
        if (details.length > 0) {
          formData.append("item[details]", details);
        }

        var ingredients = this.$el.find("#item-edititem-ingredients").val().trim();
        if (ingredients.length > 0) {
          formData.append("item[ingredients]", ingredients);
        }

        var warnings = this.$el.find("#item-edititem-warnings").val().trim();
        if (warnings.length > 0) {
          formData.append("item[warnings]", warnings);
        }

        var directions = this.$el.find("#item-edititem-directions").val().trim();
        if (directions.length > 0) {
          formData.append("item[directions]", directions);
        }

        var otherImages = this.$el.find("#item-edititem-other-image").get(0).files;
        var otherImagesCount = otherImages.length;
        if (otherImagesCount > 0) {
          for (var index = 0; index < otherImagesCount; ++index) {
            formData.append(["item[item_image][", index, "][image]"].join(""), otherImages[index]);
          }
        }

        var barcodeDeleteLinks = this.$el.find(".item-edititem-delete-barcode");
        if (barcodeDeleteLinks.length > 0) {
          var barcodeId = [];
          barcodeDeleteLinks.each(function() {
            if ($(this).data("delete") === "yes") {
              barcodeId.push($(this).data("barcodeId"));
            }
          });
          if (barcodeId.length > 0) {
            formData.append("item[delete_barcode]", barcodeId.join(","));
          }
        }

        var imageDeleteLinks = this.$el.find(".item-edititem-delete-image");
        if (imageDeleteLinks.length > 0) {
          var imageId = [];
          imageDeleteLinks.each(function() {
            if ($(this).data("delete") === "yes") {
              imageId.push($(this).data("imageId"));
            }
          });
          if (imageId.length > 0) {
            formData.append("item[delete_image]", imageId.join(","));
          }
        }

        if (!this.id) {
          formData.append("item[parent_category_item_id]", this.parentId);
        }

        cachedRequest.saveModelByMultipart(itemModel, this.id, formData, {
          success: function(savedModel) {
            navigator.itemShow(savedModel.id);
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/item/edit_item] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }
    },


    onDelete: function(event) {
      event.preventDefault();

      var that = this;
      confirmer("Are you sure to delete this item?", function() {
        cachedRequest.destroyModel(itemModel, that.id, {
          success: function(destroyedModel) {
            navigator.itemManage(destroyedModel.get("parent_category_item_id"));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/item/edit_item] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }).open();
    },


    deleteBarcodeOrImage: function(event) {
      event.preventDefault();

      var deleteLink = $(event.currentTarget);

      if (deleteLink.data("delete") === "yes") {
        deleteLink.html("Delete");
        deleteLink.data("delete", "no");
      } else {
        this.formHelper.refreshSubmit(this.$el.find("#item-edititem-submit"));
        deleteLink.html("Click to cancle delete");
        deleteLink.data("delete", "yes");
      }
    },


    startBarcodeScan: function() {
      if (cordova) {
        var that = this;

        cordova.exec(
          function(resultArray) {
            var barcodeInput = that.$el.find("#item-edititem-barcode");
            barcodeInput.val(resultArray[0]);
            that.$el.find("#item-edititem-barcode-type").val(resultArray[1]);
            barcodeInput.trigger("input");
          },

          function(error) {
            var errorMessage = ["Scan Failed: ", error].join("");
            logger(errorMessage);
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
        var errorMessage = "[view/item/edit] - Cordova not found.";
        logger(errorMessage);
        errorHandler(null, errorMessage);
      }
    }
  });


  return itemEdititemView;
});
