modulejs.define("view/order/index", [
  "logger",
  "backbone",
  "jst",
  "app/constant",
  "app/utility",
  "app/cookie",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "collection/order/index"
], function(logger, Backbone, JST, constant, utility, cookie, cachedRequest, navigator, errorHandler, orderIndexCollection) {
  "use strict";


  var orderIndexView = Backbone.View.extend({
    mainT: JST["template/order/index"],
    loadingT: JST["template/main/loading"],


    render: function() {
      var that = this;

      var token = cookie.tokenHandler.getToken();

      if (token && token !== constant.session.GUEST_TOKEN) {
        that.$el.html(that.loadingT());

        var user = cookie.user.getSession().user;

        cachedRequest.fetchCollection(orderIndexCollection, {userId: user.id}, {
          success: function(fetchedOrders) {
            that.$el.html(that.mainT({
              allOrders: fetchedOrders,
              navigator: navigator,
              utility: utility
            }));
          },

          error: function(collection, jqXHR) {
            logger(jqXHR);
            errorHandler(["[view/order/index] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      } else {
        navigator.mainHome({replace: true});
      }

      return this;
    },


    events: {},


    remove: function() {
      Backbone.View.prototype.remove.call(this);
    }
  });


  return orderIndexView;
});
