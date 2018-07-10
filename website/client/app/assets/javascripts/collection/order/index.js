modulejs.define("collection/order/index", [
  "backbone",
  "jquery",
  "lib/backbone_cache",
  "app/utility",
  "model/order"
], function(Backbone, $, backboneCache, utility, orderModel) {
  "use strict";


  var orderIndexCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        user_id: options.userId.toString()
      };
    },


    model: orderModel,


    url: function() {
      return [utility.pathToUrl("/orders"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return orderIndexCollection;
});
