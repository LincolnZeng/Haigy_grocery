modulejs.define("collection/feedback/index", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/feedback"
], function(Backbone, $, backboneCache, utility, feedbackModel) {
  "use strict";


  var feedbackIndexCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        from: options.from,
        to: options.to
      };
    },


    model: feedbackModel,


    url: function() {
      return [utility.pathToUrl("/feedbacks"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return feedbackIndexCollection;
});
