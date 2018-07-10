modulejs.define("model/user_address", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var useraddressModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/user_addresses"),


    parse: function(response) {
      return response;
    },


    getNormalizedAddress: function() {
      return utility.getNormalizedAddressAttributeObject(this.attributes);
    },


    isDefault: function() {
      if (this.attributes) {
        return this.attributes.set_as_default;
      } else {
        return false;
      }
    },


    setAsDefault: function(bool) {
      this.attributes.set_as_default = bool;
    }
  }, {
    cacher: backboneCache.generateModelCacher("user_address")
  });


  return useraddressModel;
});
