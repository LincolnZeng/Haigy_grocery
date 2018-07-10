modulejs.define("view/main/home", [
  "backbone",
  "jst",
  "app/constant",
  "app/navigator"
], function(Backbone, JST, constant, navigator) {
  "use strict";


  var homeView = Backbone.View.extend({
    template: JST["template/main/home"],


    render: function() {
      this.$el.html(this.template({constant: constant, navigator: navigator}));
      return this;
    }
  });


  return homeView;
});