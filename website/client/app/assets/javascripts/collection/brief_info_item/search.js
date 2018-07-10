modulejs.define("collection/brief_info_item/search", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/constant",
  "app/utility",
  "model/brief_info_item"
], function(Backbone, $, backboneCache, constant, utility, briefinfoitemModel) {
  "use strict";


  var briefinfoitemSearchCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.hasMoreToLoad = false;
      this.categoryPath = [];
      this.urlParams = {
        keyword: options.keyword.toString(),
        page: options.page.toString(),
        zip_code: options.zipCode.toString()
      };
    },


    model: briefinfoitemModel,


    url: function() {
      return [utility.pathToUrl("/brief_info_items/search"), "?", $.param(this.urlParams)].join("");
    },


    parse: function(response) {
      this.categoryPath = response.category_path;
      this.hasMoreToLoad = response.has_more_to_load;
      return response.item;
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(
      briefinfoitemModel,
      "search",
      ["keyword", "page", "zipCode"],
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


  return briefinfoitemSearchCollection;
});
