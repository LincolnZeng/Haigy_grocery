modulejs.define("model/session", [
  "backbone",
  "haigy/lib/1.0.0/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var sessionModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/sessions")
  }, {
    cacher: backboneCache.generateModelCacher("session"),
  });


  return sessionModel;
});
