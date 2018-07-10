modulejs.define("view/item/with_barcode", [
  "logger",
  "backbone",
  "jst"
], function(logger, Backbone, JST) {
  "use strict";


  var itemWithbarcodeView = Backbone.View.extend({
    initialize: function(options) {
      this.barcode = options.barcode;
      this.barcodeType = options.barcodeType;
    },


    // templates
    mainT: JST["template/item/with_barcode/main"],


    render: function() {
      this.$el.html(this.mainT());
      return this;
    }
  });


  return itemWithbarcodeView;
});