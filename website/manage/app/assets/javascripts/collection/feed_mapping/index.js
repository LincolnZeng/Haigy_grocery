modulejs.define("collection/feed_mapping/index", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/feed_mapping"
], function(Backbone, $, backboneCache, utility, feedmappingModel) {
  "use strict";


  var feedmappingIndexCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        store_item_info_id: options.storeItemInfoId
      };
    },


    model: feedmappingModel,


    url: function() {
      return [utility.pathToUrl("/feed_mappings"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return feedmappingIndexCollection;
});
