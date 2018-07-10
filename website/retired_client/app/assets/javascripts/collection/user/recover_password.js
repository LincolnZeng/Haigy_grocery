modulejs.define("collection/user/recover_password", [
  "backbone",
  "haigy/lib/1.0.0/backbone_cache",
  "app/utility",
  "model/user"
], function(Backbone, backboneCache, utility, userModel) {
  "use strict";


  var userRecoverpasswordCollection = Backbone.Collection.extend({
    model: userModel,


    url: function() {
      return utility.pathToUrl("/users/recoverPassword");
    },


    parse: function(response) {
      this.temporaryPasswordLifetimeInMinutes = response.temporary_password_lifetime_in_minutes;
      return [];
    },


    getTemporaryPasswordLifetimeInMinutes: function() {
      return this.temporaryPasswordLifetimeInMinutes;
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return userRecoverpasswordCollection;
});
