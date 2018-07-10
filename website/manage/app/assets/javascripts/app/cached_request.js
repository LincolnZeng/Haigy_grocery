modulejs.define("app/cached_request", [
  "lib/cached_request",
  "app/constant"
], function(cachedRequest, constant) {
  "use strict";


  var haigyManageCachedRequest = new cachedRequest({
    tokenCacheKey: constant.cookie.cacheKey.TOKEN,
    tokenCacheLifetimeInMinute: constant.session.LIFETIME_IN_MINUTE,
    responseHeaderTokenAttribute: constant.session.RESPONSE_HEADER_TOKEN_ATTRIBUTE
  });


  return haigyManageCachedRequest;
});