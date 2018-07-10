modulejs.define("haigy/lib/1.1.0/backbone_cache", [
  "underscore",
  "haigy/lib/1.1.0/key_value_cache"
], function(_, KeyValueCache) {
  "use strict";


  var BackboneCache = function() {
    this.collectionKey = {};
  };


  BackboneCache.prototype = new KeyValueCache();


  BackboneCache.prototype.clearAll = function() {
    this.reset();
    for (var key in this.collectionKey) {
      this.collectionKey[key] = {};
    }
  };


  BackboneCache.prototype.generateModelNoCacheCacher = function() {
    return {
      modelName: null,
      getModel: function() { return null; },
      modelFetched: function() {},
      modelCreated: function() {},
      modelUpdated: function() {},
      modelDestroyed: function() {}
    };
  };


  BackboneCache.prototype.generateCollectionNoCacheCacher = function() {
    return {
      collectionCacheKey: function() {return "";},
      getCollection: function() {return null;},
      collectionFetched: function() {}
    };
  };


  // "operationAfterModelCreated" could be "ignore", "add", or "clear".
  // "operationAfterModelUpdated" could be "ignore", "update", or "clear"
  // "operationAfterModelDestroyed" could be "ignore", "remove", or "clear"
  // the default value for "operationAfterModelCreated" is "clear".
  // the default value for "operationAfterModelUpdated" is "update".
  // the default value for "operationAfterModelDestroyed" is "remove".

  // "ignore" : means do nothing to the cached collection after a model change.
  // "add" : means add the new created model into the cached collection.
  // "update": means update the model in the cached collection according to the model change.
  // "remove": means remove the deleted model from the cached collection.
  // "clear" : means clear the cached collection after a model change.
  BackboneCache.prototype.generateCollectionCacher = function(
    modelDefForThisCollection,
    collectionActionName,
    arrayForCacheRequiredParameters,
    enableModelFetch,
    operationAfterModelCreated,   // could be "ignore", "add", or "clear"
    operationAfterModelUpdated,   // could be "ignore", "update", or "clear"
    operationAfterModelDestroyed,   // could be "ignore", "remove", or "clear"
    customizedCacheLifetimeInMinute
  ) {
    var that = this;
    var errorMessage = "";

    if (typeof collectionActionName !== "string" || collectionActionName.trim().length === 0) {
      errorMessage = "Error: invalid collection action name";
      alert(errorMessage);
      console.log(errorMessage);
      return;
    }

    var modelName = modelDefForThisCollection.cacher.modelName;

    if (!modelName) {
      errorMessage = "Error: invalid model name. The model may have the cache disabled.";
      alert(errorMessage);
      console.log(errorMessage);
      return;
    }

    if (!that.collectionKey[modelName]) {
      that.collectionKey[modelName] = {};
    }

    return {
      cacheLifetime: customizedCacheLifetimeInMinute || that.cacheLifetimeInMinute,
      modelName: modelName,
      collectionActionName: collectionActionName,
      cacheRequiredParameters: arrayForCacheRequiredParameters,
      enableModelFetch: enableModelFetch,   // could be "true", "false", or a "function(collection, modelFetchParameters)" that returns "true" or "false"
      operationAfterModelCreated: operationAfterModelCreated || "clear",
      operationAfterModelUpdated: operationAfterModelUpdated || "update",
      operationAfterModelDestroyed: operationAfterModelDestroyed || "remove",

      collectionCacheKey: function(fetchParameters) {
        var key = [this.modelName, "-", this.collectionActionName].join("");
        if (this.cacheRequiredParameters && this.cacheRequiredParameters.length > 0) {
          fetchParameters = fetchParameters || {};
          var count = this.cacheRequiredParameters.length;
          var parameterArray = [];
          for (var index = 0; index < count; ++index) {
            parameterArray.push([
              this.cacheRequiredParameters[index],
              "[",
              fetchParameters[this.cacheRequiredParameters[index]],
              "]"
            ].join(""));
          }
          key = [key, "-", parameterArray.join("-")].join("");
        }
        return key;
      },

      getCollection: function(fetchParameters) {
        return that.getCache(this.collectionCacheKey(fetchParameters));
      },

      collectionFetched: function(fetchedCollection, fetchParameters) {
        var key = this.collectionCacheKey(fetchParameters);
        that.setCache(key, fetchedCollection, this.cacheLifetime);
        that.collectionKey[this.modelName][key] = {
          enableModelFetch: this.enableModelFetch,
          operationAfterModelCreated: this.operationAfterModelCreated,
          operationAfterModelUpdated: this.operationAfterModelUpdated,
          operationAfterModelDestroyed: this.operationAfterModelDestroyed
        };

        // console.log("--- fetch collection ---");
        // console.log(that.collectionKey);
        // console.log("---");
      }
    };
  };


  BackboneCache.prototype.generateModelCacher = function(modelName, customizedCacheLifetimeInMinute) {
    if (typeof modelName !== "string" || modelName.trim().length === 0) {
      var errorMessage = "Error: invalid model name";
      alert(errorMessage);
      console.log(errorMessage);
      return;
    }

    var that = this;

    return {
      cacheLifetime: customizedCacheLifetimeInMinute || that.cacheLifetimeInMinute,
      modelName: modelName.trim(),

      modelCacheKey: function(modelId) {
        if (!modelId) {
          var errorMessage = "Error: invalid model id";
          alert(errorMessage);
          console.log(errorMessage);
          return;
        }

        return [this.modelName, "[", modelId, "]"].join("");
      },

      // TODO: make "fetchParameters" be supported better
      getModel: function(modelId, fetchParameters) {
        var cachedModel = that.getCache(this.modelCacheKey(modelId));

        if (cachedModel) {
          if (fetchParameters) {
            if (_.isEqual(fetchParameters, cachedModel.fetchParameters)) {
              return cachedModel.model;
            } else {
              return null;
            }
          } else {
            if (cachedModel.fetchParameters) {
              return null;
            } else {
              return cachedModel.model;
            }
          }
        } else {
          var modelCollectionKeys = that.collectionKey[this.modelName];
          if (modelCollectionKeys) {
            for (var key in modelCollectionKeys) {
              var collection = that.getCache(key);
              if (collection) {
                var enableModelFetch = modelCollectionKeys[key].enableModelFetch;
                if (enableModelFetch === true || (typeof enableModelFetch === "function" && enableModelFetch(collection, fetchParameters))) {
                  var model = collection.get(modelId);
                  if (model) {
                    this.modelFetched(model, fetchParameters);
                    return model;
                  }
                }
              } else {
                delete modelCollectionKeys[key];
              }
            }
          }
          return null;
        }
      },

      modelFetched: function(fetchedModel, fetchParameters) {
        if (fetchedModel.id) {
          var modelCache = {model: fetchedModel};
          if (fetchParameters) {
            modelCache.fetchParameters = fetchParameters;
          }
          that.setCache(this.modelCacheKey(fetchedModel.id), modelCache, this.cacheLifetime);
        }
      },

      modelCreated: function(createdModel) {
        if (createdModel.id) {
          that.setCache(this.modelCacheKey(createdModel.id), {model: createdModel}, this.cacheLifetime);

          var modelCollectionKeys = that.collectionKey[this.modelName];
          if (modelCollectionKeys) {
            for (var key in modelCollectionKeys) {
              var collection = that.getCache(key);
              if (collection) {
                var operationAfterModelCreated = modelCollectionKeys[key].operationAfterModelCreated;
                if (typeof operationAfterModelCreated === "function") {
                  operationAfterModelCreated = operationAfterModelCreated(collection, createdModel);
                }

                switch(operationAfterModelCreated) {
                case "ignore":
                  break;
                case "add":
                  collection.add(createdModel, {merge: true});
                  break;
                case "clear":
                  that.clearCache(key);
                  delete modelCollectionKeys[key];
                  break;
                default:
                  var errorMessage = 'Error: "operationAfterModelCreated" could only be set as "ignore", "add", or "clear"';
                  alert(errorMessage);
                  console.log(errorMessage);
                  return;
                }
              } else {
                delete modelCollectionKeys[key];
              }
            }
          }

          // console.log("--- create model ---");
          // console.log(that.collectionKey);
          // console.log("---");
        }
      },

      modelUpdated: function(updatedModel) {
        that.setCache(this.modelCacheKey(updatedModel.id), {model: updatedModel}, this.cacheLifetime);

        var modelCollectionKeys = that.collectionKey[this.modelName];
        if (modelCollectionKeys) {
          for (var key in modelCollectionKeys) {
            var collection = that.getCache(key);
            if (collection) {
              var operationAfterModelUpdated = modelCollectionKeys[key].operationAfterModelUpdated;
              if (typeof operationAfterModelUpdated === "function") {
                operationAfterModelUpdated = operationAfterModelUpdated(collection, updatedModel);
              }

              switch(operationAfterModelUpdated) {
              case "ignore":
                break;
              case "update":
                collection.set(updatedModel, {merge: true, add: false, remove: false});
                break;
              case "clear":
                that.clearCache(key);
                delete modelCollectionKeys[key];
                break;
              default:
                var errorMessage = 'Error: "operationAfterModelUpdated" only could be set as "ignore", "update", or "clear"';
                alert(errorMessage);
                console.log(errorMessage);
                return;
              }
            } else {
              delete modelCollectionKeys[key];
            }
          }
        }

        // console.log("--- update model ---");
        // console.log(that.collectionKey);
        // console.log("---");
      },

      modelDestroyed: function(destroyedModel) {
        that.clearCache(this.modelCacheKey(destroyedModel.id));

        var modelCollectionKeys = that.collectionKey[this.modelName];
        if (modelCollectionKeys) {
          for (var key in modelCollectionKeys) {
            var collection = that.getCache(key);
            if (collection) {
              var operationAfterModelDestroyed = modelCollectionKeys[key].operationAfterModelDestroyed;
              if (typeof operationAfterModelDestroyed === "function") {
                operationAfterModelDestroyed = operationAfterModelDestroyed(collection, destroyedModel);
              }

              switch(operationAfterModelDestroyed) {
              case "ignore":
                break;
              case "remove":
                collection.remove(destroyedModel);
                break;
              case "clear":
                that.clearCache(key);
                delete modelCollectionKeys[key];
                break;
              default:
                var errorMessage = 'Error: "operationAfterModelDestroyed" only could be set as "ignore", "remove", or "clear"';
                alert(errorMessage);
                console.log(errorMessage);
                return;
              }
            } else {
              delete modelCollectionKeys[key];
            }
          }
        }

        // console.log("--- destroy model ---");
        // console.log(that.collectionKey);
        // console.log("---");
      }
    };
  };


  var backboneCacheInstance = new BackboneCache();


  return backboneCacheInstance;
});
