modulejs.define("model/store", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var storeModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/stores")
  }, {
    cacher: backboneCache.generateModelCacher("store")
  });


  return storeModel;
});