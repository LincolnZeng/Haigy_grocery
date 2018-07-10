modulejs.define("collection/cart_entry/synchronize_all", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/cart_entry"
], function(Backbone, $, backboneCache, utility, cartentryModel) {
  "use strict";


  var cartentrySynchronizeallCollection = Backbone.Collection.extend({
    initialize: function(allModels, options) {
      if (options) {
        if (options.cartId) {
          this.setCartId(options.cartId);
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
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return cartentrySynchronizeallCollection;
});
