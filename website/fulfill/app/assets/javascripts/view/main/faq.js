modulejs.define("view/main/faq", [
  "backbone",
  "jst",
  "app/navigator"
], function(Backbone, JST, navigator) {
  "use strict";


  var mainFaqView = Backbone.View.extend({
    template: JST["template/main/faq"],


    render: function() {
      this.$el.html(this.template());
      this.$("#main-faq-content").accordion();
      return this;
    },


    events: {
      "click #main-faq-back": "goBack"
    },


    goBack: function(event) {
      event.preventDefault();
      navigator.back();
    },


    remove: function() {
      this.$("#main-faq-content").accordion("destroy");
      Backbone.View.prototype.remove.call(this);
    }
  });


  return mainFaqView;
});
