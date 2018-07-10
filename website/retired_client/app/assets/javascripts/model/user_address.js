modulejs.define("model/user_address", [
  "backbone",
  "haigy/lib/1.0.0/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var useraddressModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/user_addresses")
  }, {
    cacher: backboneCache.generateModelCacher("user_address")
  });


  return useraddressModel;
});
