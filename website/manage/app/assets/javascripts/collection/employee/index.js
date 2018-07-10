modulejs.define("collection/employee/index", [
  "backbone",
  "lib/backbone_cache",
  "app/utility",
  "model/employee"
], function(Backbone, backboneCache, utility, employeeModel) {
  "use strict";


  var employeeIndexCollection = Backbone.Collection.extend({
    model: employeeModel,


    url: function() {
      return utility.pathToUrl("/employees");
    }
  }, {
    cacher: backboneCache.generateCollectionCacher(employeeModel, "index", [], true, "add")
  });


  return employeeIndexCollection;
});
