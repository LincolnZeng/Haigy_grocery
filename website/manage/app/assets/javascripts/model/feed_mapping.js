modulejs.define("model/feed_mapping", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var feedmappingModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/feed_mappings")
  }, {
    cacher: backboneCache.generateModelCacher("feed_mapping")
  });


  return feedmappingModel;
});
