modulejs.define("collection/user_address/index", [
  "backbone",
  "jquery",
  "haigy/lib/1.0.0/backbone_cache",
  "app/utility",
  "model/user_address"
], function(Backbone, $, backboneCache, utility, useraddressModel) {
  "use strict";


  var collectionBehaviorAfterModelChange = function(collection, model, behaviorWhenModelInCollection, behaviorWhenModelNotInCollection) {
    if (collection.urlParams.user_id === model.get("user_id").toString()) {
      return behaviorWhenModelInCollection;
    } else {
      return behaviorWhenModelNotInCollection;
    }
  };


  var useraddressIndexCollection = Backbone.Collection.extend({
    initialize: function(options) {
      this.urlParams = {
        user_id: options.userId.toString()
      };
    },


    model: useraddressModel,


    url: function() {
      return [utility.pathToUrl("/user_addresses"), "?", $.param(this.urlParams)].join("");
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(
      useraddressModel,
      "index",
      ["userId"],
      true,

      function(collection, newUserAddress) {
        return collectionBehaviorAfterModelChange(collection, newUserAddress, "add", "ignore");
      },

      function(collection, updatedUserAddress) {
        return collectionBehaviorAfterModelChange(collection, updatedUserAddress, "update", "ignore");
      },

      function(collection, deletedUserAddress) {
        return collectionBehaviorAfterModelChange(collection, deletedUserAddress, "remove", "ignore");
      }
    ),

    resetDefaultUserAddressInCache: function(currentDefaultUserAddressId, userId) {
      var fetchParameter = {userId: userId};
      var cachedUserAddressCollection = this.cacher.getCollection(fetchParameter);
      if (cachedUserAddressCollection) {
        var currentDefaultUserAddressIdString = (currentDefaultUserAddressId || "").toString();
        cachedUserAddressCollection.each(function(userAddress) {
          if (userAddress.id.toString() === currentDefaultUserAddressIdString) {
            userAddress.set("set_as_default", true);
          } else {
            if (userAddress.get("set_as_default")) {
              userAddress.set("set_as_default", false);
            }
          }
        });
        this.cacher.collectionFetched(cachedUserAddressCollection, fetchParameter);
      }
    },

    hasCollectionCache: function(userId) {
      var fetchParameter = {userId: userId};
      if (this.cacher.getCollection(fetchParameter)) {
        return true;
      } else {
        return false;
      }
    }
  });


  return useraddressIndexCollection;
});
