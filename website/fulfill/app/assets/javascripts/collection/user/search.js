modulejs.define("collection/user/search", [
  "backbone",
  "lib/backbone_cache",
  "app/utility",
  "model/user"
], function(Backbone, backboneCache, utility, userModel) {
  "use strict";


  var userSearchCollection = Backbone.Collection.extend({
    model: userModel,


    url: function() {
      return utility.pathToUrl("/users/search");
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return userSearchCollection;
});
