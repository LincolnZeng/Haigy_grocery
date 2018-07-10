modulejs.define("model/company", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var companyModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/companies")
  }, {
    cacher: backboneCache.generateModelCacher("company")
  });


  return companyModel;
});