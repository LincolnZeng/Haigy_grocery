modulejs.define("view/main/error", [
  "backbone",
  "jst",
  "app/navigator"
], function(Backbone, JST, navigator) {
  "use strict";


  var errorView = Backbone.View.extend({
    initialize: function(options) {
      this.errorMessage = options.errorMessage;
    },


    template: JST["template/main/error"],


    render: function() {
      this.$el.html(this.template({errorMessage: this.errorMessage}));
      return this;
    },


    events: {
      "click #main-error-back": "onBack"
    },


    onBack: function(event) {
      event.preventDefault();
      navigator.back();
    }
  });


  return errorView;
});