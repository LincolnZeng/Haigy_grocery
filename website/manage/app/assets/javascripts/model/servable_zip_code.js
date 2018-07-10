modulejs.define("model/servable_zip_code", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var servablezipcodeModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/servable_zip_codes")
  }, {
    cacher: backboneCache.generateModelCacher("servable_zip_code")
  });


  return servablezipcodeModel;
});
