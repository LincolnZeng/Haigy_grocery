modulejs.define("collection/service_area/index", [
  "backbone",
  "lib/backbone_cache",
  "app/utility",
  "model/service_area"
], function(Backbone, backboneCache, utility, serviceareaModel) {
  "use strict";


  var serviceareaIndexCollection = Backbone.Collection.extend({
    model: serviceareaModel,


    url: function() {
      return utility.pathToUrl("/service_areas");
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(serviceareaModel, "index", [], false, "add", "update", "remove", 360)
  });


  return serviceareaIndexCollection;
});
