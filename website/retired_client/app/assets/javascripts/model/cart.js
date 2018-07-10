modulejs.define("model/cart", [
  "backbone",
  "haigy/lib/1.0.0/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var cartModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/carts")
  }, {
    cacher: backboneCache.generateModelCacher("cart")
  });


  return cartModel;
});
