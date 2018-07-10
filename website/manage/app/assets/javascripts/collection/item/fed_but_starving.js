modulejs.define("collection/item/fed_but_starving", [
  "backbone",
  "lib/backbone_cache",
  "app/utility",
  "model/item"
], function(Backbone, backboneCache, utility, itemModel) {
  "use strict";


  var itemFedbutstarvingCollection = Backbone.Collection.extend({
    model: itemModel,


    url: function() {
      return utility.pathToUrl("/items/fedButStarving");
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return itemFedbutstarvingCollection;
});
