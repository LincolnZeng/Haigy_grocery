modulejs.define("model/order", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var orderModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/orders")
  }, {
    cacher: backboneCache.generateModelCacher("order")
  });


  return orderModel;
});