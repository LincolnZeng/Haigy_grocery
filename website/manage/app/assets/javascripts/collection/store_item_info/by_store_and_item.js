modulejs.define("collection/store_item_info/by_store_and_item", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/store_item_info"
], function(Backbone, $, backboneCache, utility, storeiteminfoModel) {
  "use strict";


  var storeiteminfoBystoreanditemCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        store_id: options.storeId,
        item_id: options.itemId
      };
    },


    model: storeiteminfoModel,


    url: function() {
      return [utility.pathToUrl("/store_item_infos/byStoreAndItem"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return storeiteminfoBystoreanditemCollection;
});
