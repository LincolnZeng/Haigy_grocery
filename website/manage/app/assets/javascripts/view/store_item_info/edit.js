modulejs.define("view/store_item_info/edit", [
  "confirmer",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "lib/easy_form",
  "app/cached_request",
  "app/cookie",
  "app/navigator",
  "app/utility",
  "app/error_handler",
  "model/store_item_info",
  "collection/store_item_info/by_store_and_item"
], function(confirmer, logger, Backbone, $, JST, easyForm, cachedRequest, cookie, navigator, utility, errorHandler, storeItemInfoModel, storeiteminfoBystoreanditemCollection) {
  "use strict";


  var storeiteminfoEditView = Backbone.View.extend({
    initialize: function(options) {
      this.id = options.id;
      this.itemId = options.itemId;
      this.storeId = null;

      this.formHelper = new easyForm();
    },


    mainT: JST["template/store_item_info/edit"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      that.$el.html(that.loadingT());

      if (that.id) {
        cachedRequest.fetchModel(storeItemInfoModel, that.id, {
          success: function(fetchedStoreItemInfo) {
            that.storeId = fetchedStoreItemInfo.get("store_id");

            that.$el.html(that.mainT({
              storeItemInfo: fetchedStoreItemInfo,
              pathToUrlTool: utility.pathToUrl,
              navigator: navigator
            }));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/store_item_info/edit] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      } else {
        that.storeId = cookie.getSelectedStoreId();

        if (that.storeId) {
          cachedRequest.fetchCollection(storeiteminfoBystoreanditemCollection, {
            storeId: that.storeId,
            itemId: that.itemId
          }, {
            success: function(fetchedCollection) {
              var infoCount = fetchedCollection.length;
              if (infoCount === 1) {
                var info = fetchedCollection.models[0];
                if (info.id) {
                  that.id = info.id;
                }
                that.$el.html(that.mainT({
                  storeItemInfo: info,
                  pathToUrlTool: utility.pathToUrl,
                  navigator: navigator
                }));
              } else {
                logger(fetchedCollection);
                errorHandler(null, "[view/store_item_info/edit] - Should always have one store item info in the look up collection.");
              }
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, ["[view/store_item_info/edit] - ", jqXHR.responseJSON.error_message].join(""));
            }
          });
        } else {
          that.$el.html(that.mainT({
            storeItemInfo: null,
            itemId: that.itemId,
            navigator: navigator
          }));
        }
      }

      return that;
    },


    events: {
      "input #storeiteminfo-edit-price,#storeiteminfo-edit-sale-price,#storeiteminfo-edit-quantity,#storeiteminfo-edit-note,#storeiteminfo-edit-estimated-weight": "onInput",
      "blur #storeiteminfo-edit-price,#storeiteminfo-edit-sale-price,#storeiteminfo-edit-quantity,#storeiteminfo-edit-note,#storeiteminfo-edit-estimated-weight": "onInput",
      "keyup #storeiteminfo-edit-price,#storeiteminfo-edit-sale-price,#storeiteminfo-edit-quantity,#storeiteminfo-edit-note,#storeiteminfo-edit-estimated-weight": "onKeyup",
      "change #storeiteminfo-edit-out-of-stock": "onToggleOutOfStock",
      "click #storeiteminfo-edit-submit": "onSubmit",
      "click .storeiteminfo-edit-delete": "onDelete"
    },


    onInput: function(event) {
      this.formHelper.onTextInput(event);
      this.formHelper.refreshSubmit(this.$el.find("#storeiteminfo-edit-submit"));
    },


    onKeyup: function(event) {
      if (this.formHelper.isEnterKey(event)) {
        this.$el.find("#storeiteminfo-edit-submit").trigger("click");
      }
    },


    onToggleOutOfStock: function(event) {
      var checkbox = $(event.currentTarget);
      var quantityInput = this.$el.find("#storeiteminfo-edit-quantity");
      if (checkbox.is(":checked")) {
        quantityInput.val("");
        quantityInput.prop("disabled", true);
      } else {
        quantityInput.prop("disabled", false);
      }
      this.formHelper.refreshSubmit(this.$el.find("#storeiteminfo-edit-submit"));
    },


    onSubmit: function(event) {
      var submitButton = $(event.currentTarget);
      if (this.formHelper.isSubmittable(submitButton, true)) {
        // prevent multiple triggering
        submitButton.html("Saving ...");
        this.formHelper.disableSubmit(submitButton);

        var price = parseFloat(this.$el.find("#storeiteminfo-edit-price").val());

        if (price <= 0.0) {
          alert("price cannot be 0");
          submitButton.html("Save");
          this.formHelper.enableSubmit(submitButton);
          return;
        }

        var salePrice = this.$el.find("#storeiteminfo-edit-sale-price").val().trim();
        salePrice = salePrice.length === 0 ? price : parseFloat(salePrice);
        var onSale = false;

        if (salePrice < price) {
          onSale = true;
        } else {
          salePrice = price;
        }

        var estimatedWeightInput = this.$el.find("#storeiteminfo-edit-estimated-weight");
        var hasEstimatedWeightInput = estimatedWeightInput.length > 0;
        var estimatedWeight = 0.0;
        if (hasEstimatedWeightInput) {
          estimatedWeight = parseFloat(estimatedWeightInput.val());
          if (isNaN(estimatedWeight) || estimatedWeight <= 0.0) {
            alert("Estimated Weight is not valid.");
            submitButton.html("Save");
            this.formHelper.enableSubmit(submitButton);
            return;
          }
        }

        var inStock = !this.$el.find("#storeiteminfo-edit-out-of-stock").is(":checked");
        var quantityInput = this.$el.find("#storeiteminfo-edit-quantity");

        var quantity = 0;
        if (quantityInput.length > 0) {
          quantity = quantityInput.val().trim();
          if (inStock) {
            if (quantity.length === 0) {
              quantity = 0;
            }
            quantity = parseFloat(quantity);
            if (quantity < 0.000000001) {   // TODO: make this more professional
              quantity = 0;
              inStock = false;
            }
          } else {
            quantity = 0;
          }
        }

        var storeItemInfoAttributes = {
          store_id: this.storeId,
          item_id: this.itemId,
          price: price,
          sale_price: salePrice,
          on_sale: onSale,
          estimated_weight_of_each_in_lb: estimatedWeight,
          quantity: quantity,
          in_stock: inStock,
          note: this.$el.find("#storeiteminfo-edit-note").val().trim()
        };

        if (this.id) {
          storeItemInfoAttributes.id = this.id;
        }

        if (hasEstimatedWeightInput) {
          storeItemInfoAttributes.estimated_weight_of_each_in_lb = estimatedWeight;
        }

        cachedRequest.saveModel(storeItemInfoModel, storeItemInfoAttributes, {
          success: function(savedInfo) {
            navigator.itemShow(savedInfo.get("item_id"));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/store_item_info/edit] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }
    },


    onDelete: function(event) {
      event.preventDefault();

      confirmer("Are you sure to delete this store info?", function() {
        var deleteLink = $(event.currentTarget);
        var infoId = deleteLink.data("infoId");
        deleteLink.removeClass(".storeiteminfo-edit-delete");
        deleteLink.html("Deleting ...");

        cachedRequest.destroyModel(storeItemInfoModel, infoId, {
          success: function(destroyedModel) {
            navigator.itemShow(destroyedModel.get("item_id"));
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[view/store_item_info/edit] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      }).open();
    }
  });


  return storeiteminfoEditView;
});
