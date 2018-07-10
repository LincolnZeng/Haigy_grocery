modulejs.define("model/service_area", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var serviceareaModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/service_areas")
  }, {
    cacher: backboneCache.generateModelCacher("service_area")
  });


  return serviceareaModel;
});
