modulejs.define("collection/store/index", [
  "backbone",
  "lib/backbone_cache",
  "app/utility",
  "model/store"
], function(Backbone, backboneCache, utility, storeModel) {
  "use strict";


  var storeIndexCollection = Backbone.Collection.extend({
    model: storeModel,


    url: function() {
      return utility.pathToUrl("/stores");
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(storeModel, "index", [], true, "add")
  });


  return storeIndexCollection;
});