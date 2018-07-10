modulejs.define("collection/cart_entry/index", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/cart_entry"
], function(Backbone, $, backboneCache, utility, cartentryModel) {
  "use strict";


  var cartentryIndexCollection = Backbone.Collection.extend({
    initialize: function(options) {

      this.urlParams = {
        cart_id: options.cartId.toString()
      };
    },


    model: cartentryModel,


    url: function() {
      return [utility.pathToUrl("/cart_entries"), "?", $.param(this.urlParams)].join("");
    }


  }, {
    cacher: backboneCache.generateCollectionCacher(cartentryModel, "index", ["cartId"], false, "clear", "clear", "clear")
  });


  return cartentryIndexCollection;
});
