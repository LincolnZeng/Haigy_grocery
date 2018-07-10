modulejs.define("model/order", [
  "backbone",
  "haigy/lib/1.0.0/backbone_cache",
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
