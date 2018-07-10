modulejs.define("model/item_image", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var itemImageModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/item_images")
  }, {
    cacher: backboneCache.generateModelCacher("item_image")
  });


  return itemImageModel;
});