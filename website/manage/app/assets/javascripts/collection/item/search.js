modulejs.define("collection/item/search", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/item"
], function(Backbone, $, backboneCache, utility, itemModel) {
  "use strict";


  var itemSearchCollection = Backbone.Collection.extend({
    initialize: function(options) {
      var params = {};

      if (options.barcode) {
        params.barcode = options.barcode;
      }

      if (options.name) {
        params.name = options.name;
      }

      this.urlParams = params;
    },


    model: itemModel,


    url: function() {
      return [utility.pathToUrl("/items/search"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(itemModel, "search", ["barcode", "name"], false, "clear", "clear", "clear", 360)
  });


  return itemSearchCollection;
});
