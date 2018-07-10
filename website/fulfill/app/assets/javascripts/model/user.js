modulejs.define("model/user", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var userModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/users")
  }, {
    cacher: backboneCache.generateModelNoCacheCacher()
  });


  return userModel;
});
