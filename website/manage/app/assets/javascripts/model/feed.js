modulejs.define("model/feed", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var feedModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/feeds")
  }, {
    cacher: backboneCache.generateModelCacher("feed")
  });


  return feedModel;
});
