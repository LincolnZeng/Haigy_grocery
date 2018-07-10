modulejs.define("collection/cart_entry/index", [
  "logger",
  "backbone",
  "lib/backbone_cache",
  "app/utility",
  "model/cart_entry"
], function(logger, Backbone, backboneCache, utility, cartentryModel) {
  "use strict";


  var cartentryIndexCollection = Backbone.Collection.extend({
    initialize: function(allModels, options) {
      if (options) {
        this.setCartId(options.cartId);
      }
    },


    model: cartentryModel,


    url: function() {
      return utility.pathToUrl("/cart_entries");
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


  return cartentryIndexCollection;
});
