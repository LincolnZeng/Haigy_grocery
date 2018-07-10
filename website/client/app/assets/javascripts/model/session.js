modulejs.define("model/session", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var sessionModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/sessions")
  }, {
    cacher: backboneCache.generateModelCacher("session")
  });


  return sessionModel;
});
