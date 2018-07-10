modulejs.define("helper/cart", [
  "alerter",
  "logger",
  "underscore",
  "app/utility",
  "app/cached_request",
  "app/cookie",
  "app/constant",
  "app/navigator",
  "model/brief_info_item",
  "model/cart",
  "model/cart_entry"
], function(alerter, logger, _, utility, cachedRequest, cookie, constant, navigator,
  briefInfoItemModel, cartModel, cartentryModel
) {
  "use strict";


  var saveCartEntryIntoDatabase = function(cartEntryAttributes, saveSuccessCallback, saveErrorCallback) {
    var attributes = cartEntryAttributes || {};
    attributes.user_id = cookie.user.getUserId();
    cachedRequest.saveModel(cartentryModel, attributes, {
      success: saveSuccessCallback,
      error: function(model, jqXHR) {
        if (jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.error_code === constant.errorCode.ACTION_TOO_FREQUENTLY) {
          logger(jqXHR.responseJSON.error_message);
        } else {
          cookie.cart.clearCartIdFromCache();
          navigator.cartManage();   // a hack, need to make it better.
          logger(jqXHR);
          if (saveErrorCallback) {
            saveErrorCallback(model, jqXHR);
          }
        }
      }
    });
  };


  var removeCartEntryFromDatabase = function(cartEntryId, removeSuccessCallback, removeErrorCallback) {
    cachedRequest.destroyModel(cartentryModel, cartEntryId, {
      success: removeSuccessCallback,
      error: function(model, jqXHR) {
        cookie.cart.clearCartIdFromCache();
        navigator.cartManage();   // a hack, need to make it better.
        logger(jqXHR);
        if (removeErrorCallback) {
          removeErrorCallback(model, jqXHR);
        }
      }
    });
  };


  var getQuantityPerChange = function(purchaseUnit) {
    return constant.item.QUANTITY_PER_CHANGE[purchaseUnit] || constant.item.DEFAULT_QUANTITY_PER_CHANGE;
  };


  var cartHelper = {
    getCartIdFromCookie: function() {
      return cookie.cart.getCartIdFromCookie();
    },
    getCartIdFromCache: function() {
      return cookie.cart.getCartIdFromCache();
    },


    getZipCode: function() {
      return cookie.user.getZipCode();
    },


    getCartEntry: function(cartEntryItemId) {
      return cookie.cart.getCartEntry(cartEntryItemId);
    },


    getAllItemIdInCart: function() {
      var cartItemIdList = cookie.cart.getCartItemIdList();
      return Object.keys(cartItemIdList);
    },


    // sorted by the time that an item added to the cart. first added item will be first
    getAllItemIdInCartSorted: function() {
      var cartItemIdList = cookie.cart.getCartItemIdList();
      return Object.keys(cartItemIdList).sort(function(keyOne, keyTwo){return cartItemIdList[keyOne]-cartItemIdList[keyTwo];});
    },


    getAllCartEntry: function() {
      var allCartEntries = [];
      var allItemIds = this.getAllItemIdInCart();
      var itemCount = allItemIds.length;
      for (var index = 0; index < itemCount; ++index) {
        allCartEntries.push(cookie.cart.getCartEntry(allItemIds[index]));
      }
      return allCartEntries;
    },


    parseServerResponse: function(fetchedCartEntryCollection) {
      var that = this;

      this.clearCart(false);
      if (fetchedCartEntryCollection.getCartId()) {
        cookie.cart.setCartId(fetchedCartEntryCollection.getCartId());
      } else {
        logger("Cart ID is invalid.");
      }

      var allCartEntries = [];
      var cartEntryCreatedOrderIndex = 1;
      fetchedCartEntryCollection.each(function(fetchedCartEntryModel) {
        var cartEntry = {
          quantity: parseFloat(fetchedCartEntryModel.get("quantity")),
          itemId: fetchedCartEntryModel.get("item_id"),
          itemName: fetchedCartEntryModel.get("item_name"),
          itemUnit: (fetchedCartEntryModel.get("item_unit") || "each").toLowerCase(),
          itemCoverImagePath: fetchedCartEntryModel.get("item_cover_image_path"),
          itemSubstituteLookup: utility.lib.itemSubstitute.parseLookupString(fetchedCartEntryModel.get("item_substitute_lookup"))
        };

        if (fetchedCartEntryModel.id) {
          cartEntry.id = fetchedCartEntryModel.id;
        }

        var storeItemInfo = that.parseItemStoreInfo(fetchedCartEntryModel.get("store_item_info"));
        cartEntry.itemHasFixedSize = fetchedCartEntryModel.get("item_has_fixed_size");
        cartEntry.itemSize = fetchedCartEntryModel.get("item_size");
        cartEntry.itemEstimatedWeight = storeItemInfo.estimatedWeight;

        cartEntry.inStock = storeItemInfo.inStock;
        cartEntry.storeId = storeItemInfo.storeId;
        cartEntry.unitPrice = storeItemInfo.unitPrice;
        cartEntry.onSale = storeItemInfo.onSale;
        cartEntry.regularUnitPrice = storeItemInfo.regularUnitPrice;

        // "cartEntryCreatedOrderIndex" is a hack to prevent "createdAt" time are all the same
        cookie.cart.setCartEntry(fetchedCartEntryModel.get("item_id"), cartEntry, cartEntryCreatedOrderIndex);
        allCartEntries.push(cartEntry);

        ++cartEntryCreatedOrderIndex;
      });

      return allCartEntries;
    },


    parseItemStoreInfo: function(storeItemInfo) {
      var storeId = null;
      var inStock = false;
      var onSale = false;
      var unitPrice = null;
      var regularUnitPrice = null;
      var estimatedWeight = 0.0;
      if (storeItemInfo && storeItemInfo.item_id) {
        storeId = storeItemInfo.store_id;
        inStock = (storeItemInfo.in_stock === true);
        regularUnitPrice = parseFloat(storeItemInfo.price);
        if (isNaN(regularUnitPrice)) {regularUnitPrice = 0.0;}
        if (storeItemInfo.on_sale === true) {
          onSale = true;
          unitPrice = parseFloat(storeItemInfo.sale_price);
          if (isNaN(unitPrice)) {unitPrice = 0.0;}
        } else {
          unitPrice = regularUnitPrice;
        }
        estimatedWeight = parseFloat(storeItemInfo.estimated_weight);
        if (isNaN(estimatedWeight)) {estimatedWeight = 0.0;}
      }
      return {inStock: inStock, storeId: storeId, estimatedWeight: estimatedWeight, onSale: onSale, unitPrice: unitPrice, regularUnitPrice: regularUnitPrice};
    },


    getItemQuantityInCart: function(itemId) {
      var cachedCartEntry = cookie.cart.getCartEntry(itemId);
      if (cachedCartEntry) {
        return parseFloat(cachedCartEntry.quantity);
      } else {
        return 0;
      }
    },


    addItemQuantity: function(itemId, successCallback, errorCallback) {
      var cachedCartEntry = cookie.cart.getCartEntry(itemId);
      var newQuantity = null;
      if (cachedCartEntry) {
        newQuantity = parseFloat(cachedCartEntry.quantity) + getQuantityPerChange(cachedCartEntry.itemUnit);
      }
      this.updateItemQuantity(itemId, newQuantity, null, successCallback, errorCallback);
    },


    subtractItemQuantity: function(itemId, removeFromCartWhenZeroQuantity, successCallback, errorCallback) {
      var cachedCartEntry = cookie.cart.getCartEntry(itemId);
      if (cachedCartEntry) {
        var newQuantity = parseFloat(cachedCartEntry.quantity) - getQuantityPerChange(cachedCartEntry.itemUnit);
        if (newQuantity <= 0.0 && removeFromCartWhenZeroQuantity) {
          this.removeItem(itemId, successCallback, errorCallback);
        } else {
          this.updateItemQuantity(itemId, newQuantity, null, successCallback, errorCallback);
        }
      } else {
        if (errorCallback) {errorCallback();}
      }
    },


    updateItemSubstituteLookup: function(itemId, itemSubstituteLookup) {
      var cachedCartEntry = cookie.cart.getCartEntry(itemId);
      if (cachedCartEntry) {
        cachedCartEntry.itemSubstituteLookup = utility.lib.itemSubstitute.parseLookupString(itemSubstituteLookup);
        cookie.cart.setCartEntry(itemId, cachedCartEntry);
      }
      cachedRequest.clearModelCache(briefInfoItemModel, itemId);
    },


    isAllItemSubstituteLookupGood: function() {
      var allCartEntries = this.getAllCartEntry();
      var currentTime = new Date();
      var currentEpochTime = currentTime.getTime();
      var cartEntryCount = allCartEntries.length;
      for (var index = 0; index < cartEntryCount; ++index) {
        var substituteLookup = allCartEntries[index].itemSubstituteLookup;
        if (substituteLookup && substituteLookup.createdAt) {
          if (substituteLookup.createdAt + constant.item.SUBSTITUTE_LOOKUP_LIFETIME_IN_MILLISECOND < currentEpochTime) {
            return false;
          }
        } else {
          return false;
        }
      }
      return true;
    },


    updateItemQuantity: function(itemId, newQuantity, itemAddedIndex, successCallback, errorCallback) {
      var that = this;

      var cachedCartEntry = cookie.cart.getCartEntry(itemId);
      var quantity = parseFloat(newQuantity);

      if (cachedCartEntry) {
        if (newQuantity === undefined || newQuantity === null || quantity <= 0) {
          quantity = 0;
        }

        cachedRequest.fetchModel(briefInfoItemModel, itemId, {
          fetchParameters: {zip_code: that.getZipCode()},

          success: function(fetchedItem) {
            var storeItemInfo = that.parseItemStoreInfo(fetchedItem.get("store_item_info"));

            saveCartEntryIntoDatabase(
              {id: cachedCartEntry.id, quantity: quantity, store_id: storeItemInfo.storeId},
              function() {
                cachedCartEntry.quantity = quantity;
                cachedCartEntry.inStock = storeItemInfo.inStock;
                cachedCartEntry.storeId = storeItemInfo.storeId;
                cachedCartEntry.unitPrice = storeItemInfo.unitPrice;
                cachedCartEntry.onSale = storeItemInfo.onSale;
                cachedCartEntry.regularUnitPrice = storeItemInfo.regularUnitPrice;
                cookie.cart.setCartEntry(itemId, cachedCartEntry);
                if (successCallback) {successCallback(cachedCartEntry);}
              },
              errorCallback
            );
          },

          error: function(model, jqXHR) {
            if (errorCallback) {errorCallback(model, jqXHR);}
          }
        });
      } else {
        cachedRequest.fetchModel(briefInfoItemModel, itemId, {
          fetchParameters: {zip_code: that.getZipCode()},

          success: function(fetchedItem) {
            if (fetchedItem.get("is_category")) {
              if (errorCallback) {errorCallback();}
            } else {
              var itemUnit = (fetchedItem.get("unit") || "each").toLowerCase();
              if (newQuantity === undefined || newQuantity === null) {
                quantity = getQuantityPerChange(itemUnit);
              }
              if (quantity > 0) {
                var storeItemInfo = that.parseItemStoreInfo(fetchedItem.get("store_item_info"));

                saveCartEntryIntoDatabase(
                  {item_id: fetchedItem.id, quantity: quantity, cart_id: that.getCartIdFromCookie(), store_id: storeItemInfo.storeId},
                  function(savedCartEntry) {
                    cachedCartEntry = {
                      id: savedCartEntry.id,
                      quantity: parseFloat(savedCartEntry.get("quantity")),
                      inStock: storeItemInfo.inStock,
                      storeId: storeItemInfo.storeId,
                      unitPrice: storeItemInfo.unitPrice,
                      onSale: storeItemInfo.onSale,
                      regularUnitPrice: storeItemInfo.regularUnitPrice,
                      itemId: fetchedItem.id,
                      itemName: fetchedItem.get("name"),
                      itemUnit: itemUnit,
                      itemCoverImagePath: fetchedItem.get("cover_image_path"),
                      itemSubstituteLookup: utility.lib.itemSubstitute.parseLookupString(fetchedItem.get("substitute_lookup")),
                      itemHasFixedSize: fetchedItem.get("has_fixed_item_size"),
                      itemSize: fetchedItem.get("item_size"),
                      itemEstimatedWeight: storeItemInfo.estimatedWeight
                    };
                    cookie.cart.setCartId(savedCartEntry.get("cart_id"));
                    cookie.cart.setCartEntry(itemId, cachedCartEntry, itemAddedIndex);
                    if (successCallback) {successCallback(cachedCartEntry);}
                  },
                  errorCallback
                );
              }
            }
          },

          error: function(model, jqXHR) {
            if (errorCallback) {errorCallback(model, jqXHR);}
          }
        });
      }
    },


    removeItem: function(itemId, successCallback, errorCallback) {
      var cachedCartEntry = cookie.cart.getCartEntry(itemId);

      if (cachedCartEntry) {
        removeCartEntryFromDatabase(
          cachedCartEntry.id,
          function() {
            cookie.cart.clearCartEntry(itemId);
            if (successCallback) {successCallback();}
          },
          errorCallback
        );
      } else {
        if (errorCallback) {errorCallback();}
      }
    },


    clearCart: function(alsoClearCartInDatabase, successCallback, errorCallback) {
      var that = this;

      var cartId = that.getCartIdFromCookie();
      if (cartId && alsoClearCartInDatabase) {
        cachedRequest.destroyModel(cartModel, cartId, {
          success: function() {
            cookie.cart.clearCart();
            if (successCallback) {successCallback();}
          },
          error: errorCallback
        });
      } else {
        cookie.cart.clearCart();
        if (successCallback) {successCallback();}
      }
    }
  };


  return cartHelper;
});