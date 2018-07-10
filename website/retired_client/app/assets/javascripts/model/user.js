modulejs.define("model/user", [
  "backbone",
  "haigy/lib/1.0.0/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var userModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/users")
  }, {
    cacher: backboneCache.generateModelCacher("user")
  });


  return userModel;
});
