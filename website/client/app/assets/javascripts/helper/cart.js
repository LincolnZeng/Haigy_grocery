modulejs.define("helper/cart", [
  "underscore",
  "logger",
  "app/cached_request",
  "app/cache",
  "app/cookie",
  "app/constant",
  "app/utility",
  "model/brief_info_item",
  "model/cart",
  "model/cart_entry"
], function(_, logger, cachedRequest, cache, cookie, constant, utility,
  briefInfoItemModel, cartModel, cartentryModel
) {
  "use strict";


  var saveCartEntryToDatabase = function(cartEntryAttributes, saveSuccessCallback, saveErrorCallback) {
    var token = cookie.tokenHandler.getToken();
    if (token && !cookie.user.isGuest(token)) {
      cachedRequest.saveModel(cartentryModel, cartEntryAttributes, {
        success: saveSuccessCallback,
        error: saveErrorCallback
      });
    } else {
      if (saveSuccessCallback) {saveSuccessCallback(new cartentryModel(cartEntryAttributes));}
    }
  };


  var removeCartEntryFromDatabase = function(cartEntryId, removeSuccessCallback, removeErrorCallback) {
    var token = cookie.tokenHandler.getToken();
    if (token && !cookie.user.isGuest(token)) {
      cachedRequest.destroyModel(cartentryModel, cartEntryId, {
        success: removeSuccessCallback,
        error: removeErrorCallback
      });
    } else {
      if (removeSuccessCallback) {removeSuccessCallback();}
    }
  };


  var getQuantityPerChange = function(purchaseUnit) {
    return constant.item.QUANTITY_PER_CHANGE[purchaseUnit] || constant.item.DEFAULT_QUANTITY_PER_CHANGE;
  };


  var cartHelper = {
    setCartId: function(cartId) {
      cookie.cart.setCartId(cartId);
    },
    getCartIdFromCookie: function() {
      return cookie.cart.getCartIdFromCookie();
    },
    getCartIdFromCache: function() {
      return cookie.cart.getCartIdFromCache();
    },
    clearCachedCartIdToForceCartRefresh: function() {
      cache.cartId.clear();
    },


    getZipCode: function() {
      return cookie.user.getShoppingZipCode();
    },


    isGuestCart: function() {
      return cookie.user.isGuest();
    },


    hasDeliverableZipCode: function() {
      return cookie.user.hasDeliverableZipCode();
    },


    // "cartEntryItemId" here could be either an integer or a string
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


    getAllCartEntrySorted: function() {
      return _.sortBy(this.getAllCartEntry(), "createdAt");
    },


    // summary of (price * quantity) for all items in the cart
    getTotalValueInCart: function(cartEntryArray) {
      var allCartEntries = cartEntryArray || this.getAllCartEntry();
      var totalValueInCart = 0.0;
      var entryCount = allCartEntries.length;
      for (var index = 0; index < entryCount; ++index) {
        if (allCartEntries[index].inStock === true) {
          var unitPrice = allCartEntries[index].unitPrice;
          if (unitPrice) {
            totalValueInCart += parseFloat(unitPrice) * parseFloat(allCartEntries[index].quantity);
          }
        }
      }
      return totalValueInCart;
    },


    getServerRequiredCartInfo: function() {
      var allDatabaseRequiredInfo = [];
      var allCartEntries = this.getAllCartEntrySorted();
      var cartEntryCount = allCartEntries.length;
      for (var index = 0; index < cartEntryCount; ++index) {
        var cartEntry = allCartEntries[index];
        if (cartEntry.inStock === true && cartEntry.quantity > 0) {
          var requiredInfo = {
            item_id: cartEntry.itemId,
            quantity: cartEntry.quantity,
            unit_price: cartEntry.unitPrice
          };
          allDatabaseRequiredInfo.push(requiredInfo);
        }
      }
      return allDatabaseRequiredInfo;
    },


    // "unitPriceLocked === true" after the order got placed.
    parseServerResponse: function(fetchedCartEntryCollection, synchronizeCart) {
      var that = this;

      if (synchronizeCart) {
        this.clearCart(false);
        if (fetchedCartEntryCollection.getCartId()) {
          that.setCartId(fetchedCartEntryCollection.getCartId());
        } else {
          logger("Cart ID is invalid.");
        }
      }

      var allCartEntries = [];
      var cartEntryCreatedOrderIndex = 1;
      fetchedCartEntryCollection.each(function(fetchedCartEntryModel) {
        var cartEntry = {
          addedByUser: fetchedCartEntryModel.get("added_by_user") !== false,   // default is "true"
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

        cartEntry.itemHasFixedSize = fetchedCartEntryModel.get("item_has_fixed_size");
        cartEntry.itemSize = fetchedCartEntryModel.get("item_size");

        var responsedStoreItemInfo = fetchedCartEntryModel.get("store_item_info");
        if (responsedStoreItemInfo) {
          var storeItemInfo = that.parseItemStoreInfo(responsedStoreItemInfo);
          cartEntry.itemEstimatedWeight = storeItemInfo.estimatedWeight;
          cartEntry.onSale = storeItemInfo.onSale;
          cartEntry.regularUnitPrice = storeItemInfo.regularUnitPrice;
          cartEntry.inStock = storeItemInfo.inStock;
          cartEntry.storeId = storeItemInfo.storeId;
          cartEntry.unitPrice = storeItemInfo.unitPrice;
        } else {
          cartEntry.inStock = true;
          cartEntry.storeId = fetchedCartEntryModel.get("store_id");
          cartEntry.unitPrice = parseFloat(fetchedCartEntryModel.get("unit_price"));
          cartEntry.onSale = false;
          cartEntry.regularUnitPrice = cartEntry.unitPrice;
        }

        if (synchronizeCart) {
          // "cartEntryCreatedOrderIndex" is a hack to prevent "createdAt" time are all the same
          cookie.cart.setCartEntry(fetchedCartEntryModel.get("item_id"), cartEntry, cartEntryCreatedOrderIndex);
        }
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


    generateCartEntry: function(itemAttributes, storeItemInfoAttributes, cartEntryAttributes) {
      var storeItemInfo = this.parseItemStoreInfo(storeItemInfoAttributes);
      return {
        id: cartEntryAttributes.id,
        addedByUser: cartEntryAttributes.added_by_user !== false,   // default is "true"
        quantity: parseFloat(cartEntryAttributes.quantity),
        inStock: storeItemInfo.inStock,
        storeId: storeItemInfo.storeId,
        unitPrice: storeItemInfo.unitPrice,
        onSale: storeItemInfo.onSale,
        regularUnitPrice: storeItemInfo.regularUnitPrice,
        needSubstitution: false,
        itemId: itemAttributes.id,
        itemName: itemAttributes.name,
        itemUnit: (itemAttributes.unit || "each").toLowerCase(),
        itemCoverImagePath: itemAttributes.cover_image_path,
        itemSubstituteLookup: utility.lib.itemSubstitute.parseLookupString(itemAttributes.substitute_lookup),
        itemHasFixedSize: itemAttributes.has_fixed_item_size,
        itemSize: itemAttributes.item_size,
        itemEstimatedWeight: storeItemInfo.estimatedWeight
      };
    },


    addItemQuantity: function(itemId, successCallback, errorCallback) {
      var cachedCartEntry = cookie.cart.getCartEntry(itemId);
      var newQuantity = null;
      if (cachedCartEntry) {
        newQuantity = parseFloat(cachedCartEntry.quantity) + getQuantityPerChange(cachedCartEntry.itemUnit);
      }
      this.updateItemQuantity(itemId, newQuantity, null, successCallback, errorCallback);
    },


    subtractItemQuantity: function(itemId, removeItemWhenZeroQuantity, successCallback, errorCallback) {
      var cachedCartEntry = cookie.cart.getCartEntry(itemId);
      if (cachedCartEntry) {
        var newQuantity = parseFloat(cachedCartEntry.quantity) - getQuantityPerChange(cachedCartEntry.itemUnit);
        if (removeItemWhenZeroQuantity && newQuantity <= 0) {
          this.removeItem(itemId, successCallback, errorCallback);
        } else {
          this.updateItemQuantity(itemId, newQuantity, null, successCallback, errorCallback);
        }
      } else {
        if (errorCallback) {errorCallback();}
      }
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

            saveCartEntryToDatabase(
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
                var storeItemInfo = fetchedItem.get("store_item_info");

                saveCartEntryToDatabase(
                  {item_id: fetchedItem.id, quantity: quantity, added_by_user: true, cart_id: that.getCartIdFromCookie(), store_id: storeItemInfo.store_id},
                  function(savedCartEntry) {
                    cachedCartEntry = that.generateCartEntry(
                      fetchedItem.attributes,
                      storeItemInfo,
                      savedCartEntry.attributes
                    );
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
        if (cachedCartEntry.addedByUser) {
          removeCartEntryFromDatabase(
            cachedCartEntry.id,
            function() {
              cookie.cart.clearCartEntry(itemId);
              if (successCallback) {successCallback();}
            },
            errorCallback
          );
        } else {
          this.updateItemQuantity(itemId, 0, null, successCallback, errorCallback);
        }
      } else {
        if (errorCallback) {errorCallback();}
      }
    },


    // "itemList" must be an array, and it should look like:
    // [{itemId: 1, quantity: 5}, {itemId: 1, quantity: 3}, {itemId: 5, quantity: 1}]
    //
    // the default quantity is 1.
    // if the item is already in the cart, only update the quantity when the cart quantity is smaller.
    addItemsBackToCart: function(itemList, completeCallback) {
      var callbackCount = itemList.length;
      if (callbackCount > 0) {
        var itemCount = itemList.length;
        for (var index = 0; index < itemCount; ++index) {
          var item = itemList[index];
          var itemId = item.itemId;
          var quantity = parseFloat(item.quantity);
          var willAddToCart = true;
          if (isNaN(quantity) || quantity < 0) {
            quantity = 0;
          }
          var cartEntry = this.getCartEntry(itemId);
          if (cartEntry && cartEntry.quantity >= quantity) {
            willAddToCart = false;
          }
          if (willAddToCart) {
            this.updateItemQuantity(itemId, quantity, index, function() {
              --callbackCount;
              if (callbackCount === 0 && completeCallback) {
                completeCallback();
              }
            }, function() {
              --callbackCount;
              if (callbackCount === 0 && completeCallback) {
                completeCallback();
              }
            });
          } else {
            --callbackCount;
            if (callbackCount === 0 && completeCallback) {
              completeCallback();
            }
          }
        }
      } else {
        if (completeCallback) {
          completeCallback();
        }
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