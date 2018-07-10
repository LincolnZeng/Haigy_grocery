modulejs.define("collection/cart_entry/synchronize_all", [
  "logger",
  "backbone",
  "jquery",
  "haigy/lib/1.0.0/backbone_cache",
  "app/utility",
  "model/cart_entry"
], function(logger, Backbone, $, backboneCache, utility, cartentryModel) {
  "use strict";


  var cartentrySynchronizeallCollection = Backbone.Collection.extend({
    initialize: function(allModels, options) {
      if (options) {
        if (options.cartId) {
          this.setCartId(options.cartId);
        }
        if (options.specialRequestsInJsonFormat) {
          this.setSpecialRequests(options.specialRequestsInJsonFormat);
        }
      }
    },


    model: cartentryModel,


    url: function() {
      return utility.pathToUrl("/cart_entries/synchronizeAll");
    },


    parse: function(response) {
      this.setCartId(response.cart_id);
      return response.cart_entry;
    },


    setCartId: function(cartId) {
      this.cartId = cartId;
    },


    getCartId: function() {
      return this.cartId;
    },


    setSpecialRequests: function(specialRequestsInJsonFormat) {
      this.specialRequests = [];
      if (specialRequestsInJsonFormat) {
        try {
          this.specialRequests = JSON.parse(specialRequestsInJsonFormat);
        } catch (error) {
          logger(error);
        }
      }
    },


    getSpecialRequests: function() {
      if (this.specialRequests) {
        return this.specialRequests;
      } else {
        return [];
      }
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return cartentrySynchronizeallCollection;
});
