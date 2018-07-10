modulejs.define("model/employee", [
  "backbone",
  "lib/backbone_cache",
  "app/utility"
], function(Backbone, backboneCache, utility) {
  "use strict";


  var employeeModel = Backbone.Model.extend({
    urlRoot: utility.pathToUrl("/employees")
  }, {
    cacher: backboneCache.generateModelCacher("employee")
  });


  return employeeModel;
});
