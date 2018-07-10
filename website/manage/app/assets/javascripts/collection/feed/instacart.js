modulejs.define("collection/feed/instacart", [
  "backbone",
  "lib/backbone_cache",
  "app/utility",
  "model/feed"
], function(Backbone, backboneCache, utility, feedModel) {
  "use strict";


  var feedInstacartCollection = Backbone.Collection.extend({
    model: feedModel,


    url: function() {
      return utility.pathToUrl("/feeds/instacart");
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return feedInstacartCollection;
});
