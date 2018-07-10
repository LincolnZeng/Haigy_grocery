modulejs.define("haigy/lib/1.1.0/cached_request", [
  "haigy/lib/1.1.0/multipart_form_ajax",
  "haigy/lib/1.1.0/local_storage_cache"
], function(multipartFormAjax, LocalStorageCache) {
  "use strict";


  var cachedRequest = function(options) {
    var that = this;

    that.tokenCacheKey = "Default-Haigy-Token";
    that.tokenCacheLifetimeInMinute = 15;
    that.responseHeaderTokenAttribute = "Default-Haigy-Token";
    that.actionBeforeRequest = function() {};

    if (options) {
      if (options.tokenCacheKey) {
        that.tokenCacheKey = options.tokenCacheKey;
      }
      if (options.tokenCacheLifetimeInMinute) {
        that.tokenCacheLifetimeInMinute = options.tokenCacheLifetimeInMinute;
      }
      if (options.responseHeaderTokenAttribute) {
        that.responseHeaderTokenAttribute = options.responseHeaderTokenAttribute;
      }
      if (options.actionBeforeRequest) {
        that.actionBeforeRequest = options.actionBeforeRequest;
      }
      that.tokenHandler = options.tokenHandler;
    }

    if (!that.tokenHandler) {
      that.tokenHandler = {
        cacher: (new LocalStorageCache({
          cacheLifetimeInMinute: that.tokenCacheLifetimeInMinute,
          expirationTimeRefreshable: true
        })).generateCacher(that.tokenCacheKey),

        setToken: function(token) {
          this.cacher.setCache(token);
        },

        getToken: function() {
          return this.cacher.getCache();
        },

        clearToken: function() {
          this.cacher.clearCache();
        }
      };
    }
  };


  // if the collection has not been cached, then "null" will be returned.
  cachedRequest.prototype.getCachedCollection = function(collectionDef, fetchParameters) {
    return collectionDef.cacher.getCollection(fetchParameters);
  },


  cachedRequest.prototype.fetchCollection = function(collectionDef, fetchParameters, options, forceFetchFromServer) {
    options = options || {};
    var cachedCollection = forceFetchFromServer ? null : collectionDef.cacher.getCollection(fetchParameters);

    if (cachedCollection) {
      if (options.success) {
        options.success(cachedCollection, null, null);
      }
    } else {
      var that = this;
      var httpMethod = options.type || "GET";   // could be POST, GET, PUT, and DELETE, but GET and POST are two most often used methods for collection
      var collection = new collectionDef(fetchParameters);
      that.actionBeforeRequest();

      collection.fetch({
        type: httpMethod,

        // warning: any parameters here are not used to generate the collection cache key
        // this option is good for large but never repeated data transfer
        data: options.data,

        success: function(fetchedCollection, jqXHR, otherOptions) {
          that.tokenHandler.setToken(otherOptions.xhr.getResponseHeader(that.responseHeaderTokenAttribute));

          collectionDef.cacher.collectionFetched(fetchedCollection, fetchParameters);
          if (options.success) {
            options.success(fetchedCollection, jqXHR, otherOptions);
          }
        },

        error: function(collectionToFetch, jqXHR, otherOptions) {
          that.tokenHandler.setToken(otherOptions.xhr.getResponseHeader(that.responseHeaderTokenAttribute));

          if (options.error) {
            options.error(collectionToFetch, jqXHR, otherOptions);
          }
        }
      });
    }
  };


  // options.fetchParameters should be an object like: {aaa: 10, bbb: "ccc"}
  cachedRequest.prototype.fetchModel = function(modelDef, modelId, options, forceFetchFromServer) {
    options = options || {};
    var fetchParameters = options.fetchParameters;
    var cachedModel = forceFetchFromServer ? null : modelDef.cacher.getModel(modelId, fetchParameters);

    if (cachedModel) {
      if (options.success) {
        options.success(cachedModel, null, null);
      }
    } else {
      var that = this;
      var model = new modelDef({id: modelId});
      that.actionBeforeRequest();

      model.fetch({
        data: fetchParameters,

        success: function(fetchedModel, jqXHR, otherOptions) {
          that.tokenHandler.setToken(otherOptions.xhr.getResponseHeader(that.responseHeaderTokenAttribute));

          modelDef.cacher.modelFetched(fetchedModel, fetchParameters);
          if (forceFetchFromServer) {
            modelDef.cacher.modelUpdated(fetchedModel);
          }

          if (options.success) {
            options.success(fetchedModel, jqXHR, otherOptions);
          }
        },

        error: function(modelToFetch, jqXHR, otherOptions) {
          that.tokenHandler.setToken(otherOptions.xhr.getResponseHeader(that.responseHeaderTokenAttribute));

          if (options.error) {
            options.error(modelToFetch, jqXHR, otherOptions);
          }
        }
      });
    }
  };


  cachedRequest.prototype.saveModel = function(modelDef, modelAttributes, options) {
    var that = this;
    options = options || {};
    var model = new modelDef(modelAttributes);
    that.actionBeforeRequest();

    model.save(model.attributes, {
      success: function(savedModel, jqXHR, otherOptions) {
        that.tokenHandler.setToken(otherOptions.xhr.getResponseHeader(that.responseHeaderTokenAttribute));

        if (modelAttributes.id) {
          modelDef.cacher.modelUpdated(savedModel);
        } else {
          modelDef.cacher.modelCreated(savedModel);
        }

        if (options.success) {
          options.success(savedModel, jqXHR, otherOptions);
        }
      },

      error: function(modelToSave, jqXHR, otherOptions) {
        that.tokenHandler.setToken(otherOptions.xhr.getResponseHeader(that.responseHeaderTokenAttribute));

        if (options.error) {
          options.error(modelToSave, jqXHR, otherOptions);
        }
      }
    });
  };


  cachedRequest.prototype.saveModelByMultipart = function(modelDef, modelId, modelAttributesInFormData, options) {
    var that = this;
    options = options || {};
    var saveMethod = modelId ? "PUT" : "POST";
    var model = new modelDef({id: modelId});
    var url = options.url || model.url();
    that.actionBeforeRequest();

    multipartFormAjax.submit(saveMethod, url, modelAttributesInFormData, {
      success: function(responseData, textStatus, jqXHR) {
        that.tokenHandler.setToken(jqXHR.getResponseHeader(that.responseHeaderTokenAttribute));

        var savedModel = new modelDef(responseData);

        if (modelId) {
          modelDef.cacher.modelUpdated(savedModel);
        } else {
          modelDef.cacher.modelCreated(savedModel);
        }

        if (options.success) {
          options.success(savedModel, jqXHR, {textStatus: textStatus});
        }
      },

      error: function(jqXHR, textStatus, errorThrown) {
        that.tokenHandler.setToken(jqXHR.getResponseHeader(that.responseHeaderTokenAttribute));

        if (options.error) {
          options.error(model, jqXHR, {textStatus: textStatus, errorThrown: errorThrown});
        }
      }
    });
  };


  cachedRequest.prototype.destroyModel = function(modelDef, modelId, options) {
    var that = this;
    options = options || {};
    var model = new modelDef({id: modelId});
    that.actionBeforeRequest();

    model.destroy({
      success: function(modelToDelete, responseData, otherOptions) {
        that.tokenHandler.setToken(otherOptions.xhr.getResponseHeader(that.responseHeaderTokenAttribute));

        var destroyedModel = new modelDef(responseData);
        modelDef.cacher.modelDestroyed(destroyedModel);
        if (options.success) {
          options.success(destroyedModel, null, otherOptions);
        }
      },

      error: function(modelToDelete, jqXHR, otherOptions) {
        that.tokenHandler.setToken(otherOptions.xhr.getResponseHeader(that.responseHeaderTokenAttribute));

        if (options.error) {
          options.error(modelToDelete, jqXHR, otherOptions);
        }
      }
    });
  };


  cachedRequest.prototype.clearModelCache = function(modelDef, modelId) {
    var modelToClearCache = new modelDef({id: modelId});
    modelDef.cacher.modelDestroyed(modelToClearCache);
  };


  return cachedRequest;
});