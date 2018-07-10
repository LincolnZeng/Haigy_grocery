modulejs.define("collection/user_address/select_address", [
  "backbone",
  "lib/backbone_cache",
  "app/constant",
  "app/utility",
  "model/user_address"
], function(Backbone, backboneCache, constant, utility, useraddressModel) {
  "use strict";


  var useraddressSelectaddressCollection = Backbone.Collection.extend({
    initialize: function() {
      this.shoppingZipCode = null;
      this.selectedAddress = null;
    },


    model: useraddressModel,


    url: function() {
      return utility.pathToUrl("/user_addresses/selectAddress");
    },


    parse: function(response) {
      this.shoppingZipCode = response.shopping_zip_code;
      this.selectedAddress = response.selected_address;
      return [];
    },


    getShoppingZipCode: function() {
      return this.shoppingZipCode;
    },


    getSelectedAddress: function() {
      return this.selectedAddress;
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return useraddressSelectaddressCollection;
});
