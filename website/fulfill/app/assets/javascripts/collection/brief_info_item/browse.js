modulejs.define("collection/brief_info_item/browse", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/constant",
  "app/utility",
  "model/brief_info_item"
], function(Backbone, $, backboneCache, constant, utility, briefinfoitemModel) {
  "use strict";


  var briefinfoitemBrowseCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.hasMoreToLoad = false;
      this.urlParams = {
        parent_category_item_id: options.parentCategoryItemId.toString(),
        zip_code: options.zipCode.toString(),
        load: options.load
      };
    },


    model: briefinfoitemModel,


    url: function() {
      return [utility.pathToUrl("/brief_info_items/browse"), "?", $.param(this.urlParams)].join("");
    },


    parse: function(response) {
      this.categoryPath = response.category_path;
      this.hasMoreToLoad = response.has_more_to_load;
      return response.item;
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(
      briefinfoitemModel,
      "browse",
      ["parentCategoryItemId", "zipCode", "load"],
      function(collection, modelFetchParameters) {
        if (collection.urlParams.zip_code === modelFetchParameters.zip_code.toString()) {
          return true;
        } else {
          return false;
        }
      },
      "clear",
      "clear",
      function(thisCollection, destroyedModel) {
        if (thisCollection.get(destroyedModel)) {
          return "clear";
        } else {
          return "ignore";
        }
      },
      constant.item.CACHED_PRICE_LIFETIME_IN_MINUTE
    )
  });


  return briefinfoitemBrowseCollection;
});
