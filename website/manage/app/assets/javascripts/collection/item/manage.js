modulejs.define("collection/item/manage", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/item"
], function(Backbone, $, backboneCache, utility, itemModel) {
  "use strict";


  var itemManageCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        parent_category_item_id: options.parentCategoryItemId
      };
    },


    model: itemModel,


    url: function() {
      return [utility.pathToUrl("/items/manage"), "?", $.param(this.urlParams)].join("");
    },


    parse: function(response) {
      this.categoryPath = response.category_path;
      return response.item;
    },


    categoryPath: function() {
      return this.categoryPath;
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return itemManageCollection;
});
