modulejs.define("model/feedback", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var feedbackModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/feedbacks")
  }, {
    cacher: backboneCache.generateModelNoCacheCacher()
  });


  return feedbackModel;
});
