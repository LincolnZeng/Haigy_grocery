modulejs.define("collection/analytical_entry/index", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/analytical_entry"
], function(Backbone, $, backboneCache, utility, analyticalentryModel) {
  "use strict";


  var analyticalentryIndexCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        from: options.from,
        to: options.to
      };
    },


    model: analyticalentryModel,


    url: function() {
      return [utility.pathToUrl("/analytical_entries"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return analyticalentryIndexCollection;
});
