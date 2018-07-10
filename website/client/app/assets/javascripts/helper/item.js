modulejs.define("helper/item", [
  "app/constant"
], function(constant) {


  var itemHelper = {
    getItemPriceDetailsFromCartEntry: function(itemCartEntry) {
      var cartEntry = itemCartEntry || {};
      var itemStoreInfo = {
        in_stock: cartEntry.inStock,
        on_sale: cartEntry.onSale,
        price: cartEntry.regularUnitPrice,
        sale_price: cartEntry.unitPrice,
        estimated_weight: cartEntry.itemEstimatedWeight
      };

      return this.getItemPriceDetails(cartEntry.itemUnit, cartEntry.itemHasFixedSize, itemStoreInfo);
    },


    getItemPriceDetails: function(itemUnit, itemHasFixedSize, itemStoreInfo) {
      var itemPriceDetails = {};

      itemPriceDetails.itemUnit = itemUnit;
      itemPriceDetails.itemHasFixedSize = itemHasFixedSize === true;
      itemPriceDetails.estimatedWeight = 0.0;
      itemPriceDetails.price = 0.0;
      itemPriceDetails.salePrice = 0.0;
      itemPriceDetails.currentPrice = 0.0;
      itemPriceDetails.estimatedCurrentPricePerLb = 0.0;
      itemPriceDetails.inStock = itemStoreInfo.in_stock === true;
      itemPriceDetails.onSale = itemStoreInfo.on_sale === true;
      itemPriceDetails.storeName = itemStoreInfo.store_name || "Unknown";
      itemPriceDetails.storeIsHaigyBase = itemStoreInfo.store_is_haigy_base === true;

      if (itemPriceDetails.inStock) {
        var price = parseFloat(itemStoreInfo.price);
        if (isNaN(price)) {price = 0.0;}
        var salePrice = parseFloat(itemStoreInfo.sale_price);
        if (isNaN(salePrice)) {salePrice = 0.0;}

        itemPriceDetails.price = price;
        itemPriceDetails.salePrice = salePrice;

        if (itemPriceDetails.price <= itemPriceDetails.salePrice) {
          itemPriceDetails.onSale = false;
        }

        if (itemPriceDetails.onSale) {
          itemPriceDetails.currentPrice = salePrice;
        } else {
          itemPriceDetails.currentPrice = price;
        }

        if (itemPriceDetails.currentPrice <= 0.0) {
          itemPriceDetails.inStock = false;
        }
      }

      if (!itemPriceDetails.itemHasFixedSize) {
        if (itemUnit !== constant.item.UNIT_PER_LB && itemStoreInfo.estimated_weight) {
          var estimatedWeight = parseFloat(itemStoreInfo.estimated_weight);
          if (isNaN(estimatedWeight)) {estimatedWeight = 0.0;}
          itemPriceDetails.estimatedWeight = estimatedWeight;

          if (estimatedWeight > 0.0 && itemPriceDetails.currentPrice > 0.0) {
            itemPriceDetails.estimatedCurrentPricePerLb = itemPriceDetails.currentPrice * 1.0 / estimatedWeight;
          }
        }
      }

      return itemPriceDetails;
    }
  };


  return itemHelper;
});