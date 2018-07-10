modulejs.define("view/order/delivery_time", [
  "logger",
  "backbone",
  "jst",
  "app/utility"
], function(logger, Backbone, JST, utility) {
  "use strict";


  var orderDeliverytimeView = Backbone.View.extend({
    initialize: function(options) {
      this.onChange = options.onChange;

      // in the format: 20151213
      this.deliveryDate = (options.deliveryDate || "").toString();

      // the number of minutes from the midnight. for example, 810 means 13:30
      this.deliveryTimeSlotStartTime = options.deliveryTimeSlotStartTime;

      // the number of minutes from the midnight. for example, 1185 means 19:45
      this.deliveryTimeSlotEndTime = options.deliveryTimeSlotEndTime;
    },


    template: JST["template/order/delivery_time"],


    render: function() {
      var that = this;

      that.$el.html(that.template({utility: utility}));

      var deliveryDateSelect = that.$("#order-delivery-time-select");
      deliveryDateSelect.dropdown({
        onChange: function(deliveryDate) {
          if (that.onChange) {
            var deliveryTimeSlotStartTime = 1140;   // 19:00
            var deliveryTimeSlotEndTime = 1260;   // 21:00
            that.onChange(deliveryDate, deliveryTimeSlotStartTime, deliveryTimeSlotEndTime);
          }
        }
      });

      var defaultSelectValue = deliveryDateSelect.dropdown("get value").toString();
      var alreadySelectedDeliveryDate = that.deliveryDate;
      if (alreadySelectedDeliveryDate) {
        deliveryDateSelect.dropdown("set selected", alreadySelectedDeliveryDate);
        if (deliveryDateSelect.dropdown("get value").toString() !== defaultSelectValue) {   // set value successfully
          if (that.onChange) {
            that.onChange(that.deliveryDate, that.deliveryTimeSlotStartTime, that.deliveryTimeSlotEndTime);
          }
        }
      }

      return that;
    },


    remove: function() {
      this.$("#order-delivery-time-select").dropdown("destroy");
      Backbone.View.prototype.remove.call(this);
    }
  });


  return orderDeliverytimeView;
});
