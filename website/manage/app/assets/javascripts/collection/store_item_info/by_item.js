modulejs.define("collection/store_item_info/by_item", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/store_item_info"
], function(Backbone, $, backboneCache, utility, storeiteminfoModel) {
  "use strict";


  var storeiteminfoByitemCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        item_id: options.itemId
      };
    },


    model: storeiteminfoModel,


    url: function() {
      return [utility.pathToUrl("/store_item_infos/byItem"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return storeiteminfoByitemCollection;
});
