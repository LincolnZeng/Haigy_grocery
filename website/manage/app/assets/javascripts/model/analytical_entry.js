modulejs.define("model/analytical_entry", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var analyticalentryModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/analytical_entries")
  }, {
    cacher: backboneCache.generateModelCacher("analytical_entry")
  });


  return analyticalentryModel;
});
