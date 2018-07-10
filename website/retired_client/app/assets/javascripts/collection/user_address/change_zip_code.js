modulejs.define("collection/user_address/change_zip_code", [
  "backbone",
  "haigy/lib/1.0.0/backbone_cache",
  "app/constant",
  "app/utility",
  "model/user_address"
], function(Backbone, backboneCache, constant, utility, useraddressModel) {
  "use strict";


  var useraddressChangezipcodeCollection = Backbone.Collection.extend({
    initialize: function() {
      this.unavailableItemsIdArray = [];
    },


    model: useraddressModel,


    url: function() {
      return utility.pathToUrl("/user_addresses/changeZipCode");
    },


    parse: function(response) {
      this.serviceAreaId = response.service_area_id || constant.demo.SERVICE_AREA_ID;
      this.unavailableItemsIdArray = response.unavailable_items_id || [];
      return [];
    },


    getServiceAreaId: function() {
      return this.serviceAreaId;
    },


    getUnavailableItemsIdArray: function() {
      return this.unavailableItemsIdArray;
    }
  }, {
    cacher: backboneCache.generateCollectionNoCacheCacher()
  });


  return useraddressChangezipcodeCollection;
});
