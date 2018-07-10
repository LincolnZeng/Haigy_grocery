modulejs.define("model/store_item_info", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var storeiteminfoModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/store_item_infos")
  }, {
    cacher: backboneCache.generateModelCacher("store_item_info")
  });


  return storeiteminfoModel;
});
