modulejs.define("model/item", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var itemModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/items")
  }, {
    cacher: backboneCache.generateModelCacher("item")
  });


  return itemModel;
});