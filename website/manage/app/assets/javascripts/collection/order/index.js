modulejs.define("collection/order/index", [
  "backbone",
  "lib/backbone_cache",
  "app/utility",
  "model/order"
], function(Backbone, backboneCache, utility, orderModel) {
  "use strict";


  var orderIndexCollection = Backbone.Collection.extend({
    model: orderModel,


    url: function() {
      return utility.pathToUrl("/orders");
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return orderIndexCollection;
});