modulejs.define("collection/servable_zip_code/index", [
  "backbone",
  "lib/backbone_cache",
  "app/utility",
  "model/servable_zip_code"
], function(Backbone, backboneCache, utility, servablezipcodeModel) {
  "use strict";


  var servablezipcodeIndexCollection = Backbone.Collection.extend({
    model: servablezipcodeModel,


    url: function() {
      return utility.pathToUrl("/servable_zip_codes");
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(servablezipcodeModel, "index", [], true, "add", "update", "remove", 360)
  });


  return servablezipcodeIndexCollection;
});
