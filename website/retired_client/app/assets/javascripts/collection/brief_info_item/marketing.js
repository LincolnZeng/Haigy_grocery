modulejs.define("collection/brief_info_item/marketing", [
  "backbone",
  "jquery",
  "haigy/lib/1.0.0/backbone_cache",
  "app/constant",
  "app/utility",
  "model/brief_info_item"
], function(Backbone, $, backboneCache, constant, utility, briefinfoitemModel) {
  "use strict";


  var briefinfoitemMarketingCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        zip_code: options.zipCode.toString()
      };
    },


    model: briefinfoitemModel,


    url: function() {
      return [utility.pathToUrl("/brief_info_items/marketing"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(
      briefinfoitemModel,
      "marketing",
      ["zipCode"],
      function(collection, modelFetchParameters) {
        if (collection.urlParams.zip_code === modelFetchParameters.zip_code.toString()) {
          return true;
        } else {
          return false;
        }
      },
      "clear",
      "clear",
      "clear",
      constant.item.CACHED_PRICE_LIFETIME_IN_MINUTE
    )
  });


  return briefinfoitemMarketingCollection;
});
