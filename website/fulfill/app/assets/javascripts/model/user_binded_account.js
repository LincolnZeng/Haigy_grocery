modulejs.define("model/user_binded_account", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var userbindedaccountModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/user_binded_accounts")
  }, {
    cacher: backboneCache.generateModelNoCacheCacher()
  });


  return userbindedaccountModel;
});