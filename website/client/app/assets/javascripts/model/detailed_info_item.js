modulejs.define("model/detailed_info_item", [
  "backbone",
  "lib/backbone_cache",
  "app/constant",
  "app/utility"
], function(Backbone, backboneCache, constant, utility) {
  "use strict";


  var detailedinfoitemModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/detailed_info_items")
  }, {
    cacher: backboneCache.generateModelCacher("detailed_info_item", constant.item.CACHED_PRICE_LIFETIME_IN_MINUTE)
  });


  return detailedinfoitemModel;
});
