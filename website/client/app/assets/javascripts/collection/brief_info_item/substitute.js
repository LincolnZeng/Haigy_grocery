modulejs.define("collection/brief_info_item/substitute", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/constant",
  "app/utility",
  "model/brief_info_item"
], function(Backbone, $, backboneCache, constant, utility, briefinfoitemModel) {
  "use strict";


  var briefinfoitemSubstituteCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        item_id: options.itemId,
        zip_code: options.zipCode,
        category_id: options.categoryId,
        keyword: options.keyword
      };
    },


    model: briefinfoitemModel,


    url: function() {
      return [utility.pathToUrl("/brief_info_items/substitute"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(
      briefinfoitemModel,
      "substitute",
      ["itemId", "zipCode", "categoryId", "keyword"],
      false,
      "clear",
      "clear",
      "clear",
      constant.item.CACHED_PRICE_LIFETIME_IN_MINUTE
    )
  });


  return briefinfoitemSubstituteCollection;
});
