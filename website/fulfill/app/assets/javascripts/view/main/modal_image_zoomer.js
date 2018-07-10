modulejs.define("view/main/modal_image_zoomer", [
  "backbone",
  "jquery",
  "jst",
  "lib/image_zoomer",
  "app/constant",
  "app/precompiled_asset"
], function(Backbone, $, JST, imageZoomer, constant, precompiledAsset) {
  "use strict";


  var mainModalimagezoomerView = Backbone.View.extend({
    initialize: function(options) {
      this.imageSrc = options.imageSrc;
      this.currentImageZoomer = null;
    },


    tagName: "div",
    className: "ui small modal haigy-other-overflow-hidden",


    template: JST["template/main/modal_image_zoomer"],


    render: function() {
      this.$el.html(this.template({imageSrc: this.imageSrc, precompiledAsset: precompiledAsset}));

      return this;
    },


    showModal: function() {
      var that = this;

      that.$el.modal({
        closable: true,
        detachable: false,
        allowMultiple: false,
        dimmerSettings: {
          opacity: constant.semanticUi.dimmer.OPACITY
        },
        onVisible: function() {
          that.currentImageZoomer = new imageZoomer(that.$("#main-m-image-zoomer-image"), {listenToWindowResize: true});
        }
      });
      that.$el.modal("show");
    },


    hideModal: function() {
      if (this.currentImageZoomer) {
        this.currentImageZoomer.destroy();
      }
      this.$el.modal("hide");
    },


    remove: function() {
      this.hideModal();
      this.$el.modal("destroy");
      this.$el.empty();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return mainModalimagezoomerView;
});
