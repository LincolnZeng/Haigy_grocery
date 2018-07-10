modulejs.define("collection/company/index", [
  "backbone",
  "lib/backbone_cache",
  "app/utility",
  "model/company"
], function(Backbone, backboneCache, utility, companyModel) {
  "use strict";


  var companyIndexCollection = Backbone.Collection.extend({
    model: companyModel,


    url: function() {
      return utility.pathToUrl("/companies");
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(companyModel, "index", [], true, "add")
  });


  return companyIndexCollection;
});