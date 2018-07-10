modulejs.define("model/brief_info_item", [
  "backbone",
  "lib/backbone_cache",
  "app/constant",
  "app/utility"
], function(Backbone, backboneCache, constant, utility) {
  "use strict";


  var briefinfoitemModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/brief_info_items")
  }, {
    cacher: backboneCache.generateModelCacher("brief_info_item", constant.item.CACHED_PRICE_LIFETIME_IN_MINUTE)
  });


  return briefinfoitemModel;
});
