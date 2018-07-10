modulejs.define("view/main/modal_busy", [
  "backbone",
  "jst",
  "app/constant"
], function(Backbone, JST, constant) {
  "use strict";


  var mainModalbusyView = Backbone.View.extend({
    initialize: function(options) {
      this.header = options.header;
      this.loadingText = options.loadingText || "One moment please ...";
      this.onVisibleCallback = options.onVisibleCallback;
    },


    tagName: "div",
    className: "ui small modal",


    template: JST["template/main/modal_busy"],


    render: function() {
      this.$el.html(this.template({header: this.header, loadingText: this.loadingText}));

      return this;
    },


    showModal: function() {
      var that = this;

      that.$el.modal({
        closable: false,
        detachable: false,
        allowMultiple: false,
        dimmerSettings: {
          opacity: constant.semanticUi.dimmer.OPACITY
        },
        onVisible: function() {
          if (that.onVisibleCallback) {
            that.onVisibleCallback();
          }
        }
      });
      that.$el.modal("show");
    },


    hideModal: function() {
      this.$el.modal("hide");
    },


    remove: function() {
      this.hideModal();
      this.$el.modal("destroy");
      this.$el.empty();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return mainModalbusyView;
});
