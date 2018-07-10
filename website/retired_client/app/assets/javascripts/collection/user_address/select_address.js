modulejs.define("collection/user_address/select_address", [
  "backbone",
  "haigy/lib/1.0.0/backbone_cache",
  "app/constant",
  "app/utility",
  "model/user_address"
], function(Backbone, backboneCache, constant, utility, useraddressModel) {
  "use strict";


  var useraddressSelectaddressCollection = Backbone.Collection.extend({
    initialize: function() {
      this.selectedAddressAttributes = null;
      this.unavailableItemsIdArray = [];
    },


    model: useraddressModel,


    url: function() {
      return utility.pathToUrl("/user_addresses/selectAddress");
    },


    parse: function(response) {
      this.serviceAreaId = response.service_area_id || constant.demo.SERVICE_AREA_ID;
      this.selectedAddressAttributes = response.selected_address;
      this.unavailableItemsIdArray = response.unavailable_items_id || [];
      return [];
    },


    getServiceAreaId: function() {
      return this.serviceAreaId;
    },


    getSelectedAddressAttributes: function() {
      return this.selectedAddressAttributes;
    },


    getUnavailableItemsIdArray: function() {
      return this.unavailableItemsIdArray;
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return useraddressSelectaddressCollection;
});
