modulejs.define("collection/store/for_company", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/store"
], function(Backbone, $, backboneCache, utility, storeModel) {
  "use strict";


  var storeForcompanyCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        company_id: options.companyId.toString()
      };
    },


    model: storeModel,


    url: function() {
      return [utility.pathToUrl("/stores"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(
      storeModel,
      "for_company",
      ["companyId"],
      true,
      function(collection, newCreatedModel) {
        if (collection.urlParams.company_id === newCreatedModel.get("company_id").toString()) {
          return "add";
        } else {
          return "ignore";
        }
      }
    )
  });


  return storeForcompanyCollection;
});
