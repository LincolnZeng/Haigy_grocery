modulejs.define("helper/cart", [
  "underscore",
  "logger",
  "app/cached_request",
  "app/cookie",
  "app/constant",
  "model/brief_info_item",
  "model/cart",
  "model/cart_entry"
], function(_, logger, cachedRequest, cookie, constant, briefInfoItemModel, cartModel, cartentryModel) {
  "use strict";


  var saveCartIntoDatabase = function(cartAttributes, saveSuccessCallback, saveErrorCallback) {
    var token = cookie.tokenHandler.getToken();
    if (token && token !== constant.session.GUEST_TOKEN) {
      cachedRequest.saveModel(cartModel, cartAttributes, {
        success: saveSuccessCallback,
        error: saveErrorCallback
      });
    } else {
      if (saveSuccessCallback) {saveSuccessCallback(new cartModel(cartAttributes));}
    }
  };


  var saveCartEntryIntoDatabase = function(cartEntryAttributes, saveSuccessCallback, saveErrorCallback) {
    var token = cookie.tokenHandler.getToken();
    if (token && token !== constant.session.GUEST_TOKEN) {
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
    if (token && token !== constant.session.GUEST_TOKEN) {
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
    setActionForEachCartStatus: function(actionForNoZipCode, actionAfterLongIdle, normalAction) {
      var token = cookie.tokenHandler.getToken();

      if (token) {
        if ((new Date()).getTime() - this.getUpdateTime() > constant.cart.MAX_ACTIVE_IDLE_TIME_IN_MILLISECOND) {
          if (actionAfterLongIdle) {
            actionAfterLongIdle();
            return;
          }
        }

        if (normalAction) {
          normalAction();
        }
      } else {   // no zip code
        if (actionForNoZipCode) {
          actionForNoZipCode();
        }
      }
    },


    // parameter "specialRequestObject" should be an object with the structure:
    // {
    //     id: xxx,
    //     summary: xxx,
    //     quantity: xxx,
    //     details: xxx
    // }
    saveSpecialRequest: function(specialRequestObject, successCallback, errorCallback) {
      var specialRequestArray = cookie.cart.getSpecialRequests();
      var requestCount = specialRequestArray.length;

      var updated = false;
      if (specialRequestObject.id) {
        specialRequestObject.id = parseInt(specialRequestObject.id);
        for (var requestIndex = 0; requestIndex < requestCount; ++requestIndex) {
          if (specialRequestArray[requestIndex].id === specialRequestObject.id) {
            specialRequestArray[requestIndex] = specialRequestObject;
            updated = true;
            break;
          }
        }
      }

      if (!updated) {
        if (requestCount > 0) {
          specialRequestObject.id = specialRequestArray[requestCount - 1].id + 1;
        } else {
          specialRequestObject.id = 1;
        }
        if (requestCount >= constant.cart.MAX_SPECIAL_REQUESTS) {
          // make sure the number of requests does not exceed the limit
          specialRequestArray.splice(0, (requestCount - constant.cart.MAX_SPECIAL_REQUESTS + 1));
        }
        specialRequestArray.push(specialRequestObject);
      }

      saveCartIntoDatabase(
        {id: this.getCartId(), special_requests: JSON.stringify(specialRequestArray)},
        function(savedCart) {
          cookie.cart.setCartId(savedCart.id);
          cookie.cart.setSpecialRequests(specialRequestArray);
          if (successCallback) {
            successCallback();
          }
        },
        errorCallback
      );
    },


    deleteSpecialRequest: function(specialRequestId, successCallback, errorCallback) {
      var foundSpecialRequest = false;
      if (specialRequestId) {
        var id = parseInt(specialRequestId);
        var specialRequestArray = cookie.cart.getSpecialRequests();
        var requestCount = specialRequestArray.length;
        for (var requestIndex = 0; requestIndex < requestCount; ++requestIndex) {
          if (specialRequestArray[requestIndex].id === id) {
            foundSpecialRequest = true;
            specialRequestArray.splice(requestIndex, 1);
            saveCartIntoDatabase(
              {id: this.getCartId(), special_requests: JSON.stringify(specialRequestArray)},
              function(savedCart) {
                cookie.cart.setCartId(savedCart.id);
                cookie.cart.setSpecialRequests(specialRequestArray);
                if (successCallback) {
                  successCallback();
                }
              },
              errorCallback
            );
            break;
          }
        }
      }
      if (!foundSpecialRequest && errorCallback) {
        errorCallback();
      }
    },


    getSpecialRequestObject: function(specialRequestId, specialRequestArray) {
      if (specialRequestId) {
        var id = parseInt(specialRequestId);
        var requestArray = specialRequestArray || cookie.cart.getSpecialRequests();
        var count = requestArray.length;
        for (var index = 0; index < count; ++index) {
          if (requestArray[index].id === id) {
            return requestArray[index];
          }
        }
      }
      return null;
    },


    getSpecialRequestArray: function() {
      return cookie.cart.getSpecialRequests();
    },


    getSpecialRequestsInJsonFormat: function() {
      return JSON.stringify(cookie.cart.getSpecialRequests());
    },


    getCartId: function() {
      return cookie.cart.getCartId();
    },


    getZipCode: function() {
      return cookie.user.getZipCode();
    },


    getUpdateTime: function() {
      return cookie.cart.getCartUpdateTime();
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


    getAllItemIdInCart: function() {
      var allItemId = [];
      var cart = cookie.cart.getCart();
      if (cart) {
        for (var itemId in cart) {
          allItemId.push(itemId);
        }
      }
      return allItemId;
    },


    getAllCartEntry: function() {
      var allCartEntries = [];
      var cart = cookie.cart.getCart();
      if (cart) {
        for (var itemId in cart) {
          allCartEntries.push(cookie.cart.getCartEntry(itemId));
        }
      }
      return allCartEntries;
    },


    // sorted by the time that an item added to the cart. first added item will be first
    getAllCartEntrySorted: function() {
      return _.sortBy(this.getAllCartEntry(), "createdAt");
    },


    getServerRequiredCartInfo: function(requireItemUnitPrice, requireMoreDetails) {
      var allDatabaseRequiredInfo = [];
      var allCartEntries = _.sortBy(this.getAllCartEntry(), "createdAt");
      var cartEntryCount = allCartEntries.length;
      for (var index = 0; index < cartEntryCount; ++index) {
        var cartEntry = allCartEntries[index];
        if (cartEntry.inStock === true) {
          var requiredInfo = {
            item_id: cartEntry.itemId,
            quantity: cartEntry.quantity
          };

          if (requireItemUnitPrice === true) {
            requiredInfo.unit_price = cartEntry.unitPrice;
          }

          if (requireMoreDetails === true) {
            requiredInfo.store_id = cartEntry.storeId;
            requiredInfo.need_substitution = cartEntry.needSubstitution;
            if (cartEntry.needSubstitution === true) {
              requiredInfo.substitutional_items = cartEntry.substitutionalItems;
            }
          }
          allDatabaseRequiredInfo.push(requiredInfo);
        }
      }
      return allDatabaseRequiredInfo;
    },


    // "unitPriceLocked === true" after the order got placed.
    parseServerResponse: function(fetchedCartEntryCollection, synchronizeCart, unitPriceLocked) {
      var that = this;

      if (synchronizeCart) {
        this.clearCart(false);
        if (fetchedCartEntryCollection.getCartId()) {
          cookie.cart.setCartId(fetchedCartEntryCollection.getCartId());
        } else {
          logger("Cart ID is invalid.");
        }
        var specialRequestArray = fetchedCartEntryCollection.getSpecialRequests();
        if (specialRequestArray) {
          if (Array.isArray(specialRequestArray)) {
            cookie.cart.setSpecialRequests(specialRequestArray);
          } else {
            logger("Special requsets is not an array.");
          }
        }
        cookie.cart.setCartUpdated();
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
          itemParentCategoryId: fetchedCartEntryModel.get("item_parent_category_id")
        };

        if (fetchedCartEntryModel.id) {
          cartEntry.id = fetchedCartEntryModel.id;
        }

        if (unitPriceLocked === true) {
          cartEntry.inStock = true;
          cartEntry.storeId = fetchedCartEntryModel.get("store_id");
          cartEntry.unitPrice = parseFloat(fetchedCartEntryModel.get("unit_price"));
        } else {
          var unitPriceInfo = that.getItemUnitPriceInfo(fetchedCartEntryModel.get("store_item_info"));
          cartEntry.inStock = unitPriceInfo.inStock;
          cartEntry.storeId = unitPriceInfo.storeId;
          cartEntry.unitPrice = unitPriceInfo.unitPrice;
        }

        if (fetchedCartEntryModel.get("need_substitution") === true) {
          cartEntry.needSubstitution = true;
          var substitutionalItems = fetchedCartEntryModel.get("substitutional_items");
          if (substitutionalItems && substitutionalItems.length > 0) {
            cartEntry.substitutionalItems = JSON.parse(substitutionalItems);
          } else {
            cartEntry.substitutionalItems = [];
          }
        } else {
          cartEntry.needSubstitution = false;
        }

        if (synchronizeCart) {
          // "cartEntryCreatedOrderIndex" is a hack to prevent "createdAt" attribute are all the same
          cookie.cart.setCartEntry(fetchedCartEntryModel.get("item_id"), cartEntry, cartEntryCreatedOrderIndex);
        }
        allCartEntries.push(cartEntry);

        ++cartEntryCreatedOrderIndex;
      });

      return allCartEntries;
    },


    getItemUnitPriceInfo: function(storeItemInfo) {
      var storeId = null;
      var inStock = false;
      var unitPrice = null;
      if (storeItemInfo && storeItemInfo.item_id) {
        storeId = storeItemInfo.store_id;
        inStock = (storeItemInfo.in_stock === true);
        if (storeItemInfo.on_sale === true) {
          unitPrice = parseFloat(storeItemInfo.sale_price);
        } else {
          unitPrice = parseFloat(storeItemInfo.price);
        }
      }
      return {inStock: inStock, storeId: storeId, unitPrice: unitPrice};
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


    subtractItemQuantity: function(itemId, successCallback, errorCallback) {
      var cachedCartEntry = cookie.cart.getCartEntry(itemId);
      if (cachedCartEntry) {
        var newQuantity = parseFloat(cachedCartEntry.quantity) - getQuantityPerChange(cachedCartEntry.itemUnit);
        this.updateItemQuantity(itemId, newQuantity, null, successCallback, errorCallback);
      } else {
        if (errorCallback) {errorCallback();}
      }
    },


    updateItemQuantity: function(itemId, newQuantity, itemAddedIndex, successCallback, errorCallback) {
      var that = this;

      var cachedCartEntry = cookie.cart.getCartEntry(itemId);
      var quantity = parseFloat(newQuantity);

      if (cachedCartEntry) {
        if (newQuantity === undefined || newQuantity === null) {
          that.removeItem(itemId, successCallback, errorCallback);
        } else {
          if (quantity > 0) {
            cachedRequest.fetchModel(briefInfoItemModel, itemId, {
              fetchParameters: {zip_code: that.getZipCode()},

              success: function(fetchedItem) {
                var unitPriceInfo = that.getItemUnitPriceInfo(fetchedItem.get("store_item_info"));

                saveCartEntryIntoDatabase(
                  {id: cachedCartEntry.id, quantity: quantity, store_id: unitPriceInfo.storeId},
                  function() {
                    cachedCartEntry.quantity = newQuantity;
                    cachedCartEntry.inStock = unitPriceInfo.inStock;
                    cachedCartEntry.storeId = unitPriceInfo.storeId;
                    cachedCartEntry.unitPrice = unitPriceInfo.unitPrice;
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
            that.removeItem(itemId, successCallback, errorCallback);
          }
        }
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
                var unitPriceInfo = that.getItemUnitPriceInfo(fetchedItem.get("store_item_info"));

                saveCartEntryIntoDatabase(
                  {item_id: fetchedItem.id, quantity: quantity, cart_id: that.getCartId(), zip_code: that.getZipCode(), store_id: unitPriceInfo.storeId},
                  function(savedCartEntry) {
                    cachedCartEntry = {
                      id: savedCartEntry.id,
                      quantity: parseFloat(savedCartEntry.get("quantity")),
                      inStock: unitPriceInfo.inStock,
                      storeId: unitPriceInfo.storeId,
                      unitPrice: unitPriceInfo.unitPrice,
                      needSubstitution: false,
                      itemId: fetchedItem.id,
                      itemName: fetchedItem.get("name"),
                      itemUnit: itemUnit,
                      itemCoverImagePath: fetchedItem.get("cover_image_path"),
                      itemParentCategoryId: fetchedItem.get("parent_category_item_id")
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


    setItemSubstitution: function(itemId, substitutionalItemIdArray, successCallback, errorCallback) {
      var cachedCartEntry = cookie.cart.getCartEntry(itemId);

      if (cachedCartEntry) {
        var that = this;

        cachedRequest.fetchModel(briefInfoItemModel, itemId, {
          fetchParameters: {zip_code: that.getZipCode()},

          success: function(fetchedItem) {
            var unitPriceInfo = that.getItemUnitPriceInfo(fetchedItem.get("store_item_info"));

            var itemIdArray = substitutionalItemIdArray || [];
            saveCartEntryIntoDatabase(
              {id: cachedCartEntry.id, substitutional_items: JSON.stringify(itemIdArray), store_id: unitPriceInfo.storeId},
              function() {
                cachedCartEntry.inStock = unitPriceInfo.inStock;
                cachedCartEntry.storeId = unitPriceInfo.storeId;
                cachedCartEntry.unitPrice = unitPriceInfo.unitPrice;
                if (itemIdArray.length > 0) {
                  cachedCartEntry.substitutionalItems = itemIdArray;
                  cachedCartEntry.needSubstitution = true;
                } else {
                  delete cachedCartEntry.substitutionalItems;
                  cachedCartEntry.needSubstitution = false;
                }
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
        if (errorCallback) {errorCallback();}
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

      var cartId = that.getCartId();
      if (cartId && alsoClearCartInDatabase) {
        cachedRequest.destroyModel(cartModel, cartId, {
          success: function() {
            cookie.cart.clearCart();
            cookie.cart.setCartUpdated();
            if (successCallback) {successCallback();}
          },
          error: errorCallback
        });
      } else {
        cookie.cart.clearCart();
        cookie.cart.setCartUpdated();
        if (successCallback) {successCallback();}
      }
    }
  };


  return cartHelper;
});