modulejs.define("view/cart/special_request", [
  "alerter",
  "confirmer",
  "logger",
  "backbone",
  "jquery",
  "jst",
  "app/constant",
  "app/navigator",
  "app/utility",
  "app/error_handler",
  "helper/cart"
], function(alerter, confirmer, logger, Backbone, $, JST, constant, navigator, utility, errorHandler, cartHelper) {
  "use strict";


  var cartSpecialrequestView = Backbone.View.extend({
    initialize: function(options) {
      this.id = null;
      this.cancelUrl = null;

      if (options) {
        if (options.jsonParams.length < constant.MAX_URL_LENGTH) {
          var params = {};
          try {
            params = JSON.parse(decodeURIComponent(options.jsonParams));
          } catch (error) {
            logger(error);
          }
          this.id = params.id;
          this.cancelUrl = params.cancelUrl;
        } else {
          var errorMessage = "[view/cart/special_request] - URL is too long.";
          logger(errorMessage);
          errorHandler(errorMessage);
        }
      }
    },


    template: JST["template/cart/special_request"],


    render: function() {
      var specialRequest = {};
      var specialRequestArray = cartHelper.getSpecialRequestArray();
      if (this.id) {
        specialRequest = cartHelper.getSpecialRequestObject(this.id, specialRequestArray) || {};
      }
      if (!specialRequest.id) {
        if (specialRequestArray.length >= constant.cart.MAX_SPECIAL_REQUESTS) {
          alerter("Sorry, we currently only allow at most 10 special requests for each order.");
          this.onCancel();
        }
      }
      this.$el.html(this.template({specialRequest: specialRequest}));
      this.specialRequestForm = this.$("#cart-specialrequest-form");
      this.initializeSpecialRequestForm(this.specialRequestForm);
      return this;
    },


    initializeSpecialRequestForm: function(specialRequestForm) {
      specialRequestForm.form({
        fields: {
          summary: {rules: [
            {type: "empty", prompt: "Please write something in the summary."},
            {type: "maxLength[200]", prompt: "The summary exceeds the maximum length of 200 characters."}
          ]},
          quantity: {rules: [
            {type: "empty", prompt: "Please tell us the quantity of the item you wish to buy."},
            {type: "maxLength[50]", prompt: "The quantity exceeds the maximum length of 50 characters."}
          ]},
          details: {rules: [{type: "maxLength[2000]", prompt: "The details of the item exceed the maximum length of 2000 characters."}]}
        },

        onSuccess: function(event) {
          event.preventDefault();
          var form = $(event.currentTarget);
          form.addClass("loading");

          var requestData = form.form("get values");

          cartHelper.saveSpecialRequest(
            {
              id: requestData.id,
              summary: utility.sanitizeString(requestData.summary),
              quantity: utility.sanitizeString(requestData.quantity),
              details: utility.sanitizeString(requestData.details)
            },

            // success callback
            function() {
              navigator.cartManage({replace: true});
            },

            // error callback
            function() {
              var errorMessage = "[view/cart/special_request] - fail to save a special request.";
              logger(errorMessage);
              errorHandler(errorMessage);
            }
          );

          return false;
        }
      });
    },


    events: {
      "click #cart-specialrequest-cancel": "onCancel",
      "click #cart-specialrequest-delete": "onDelete"
    },


    onCancel: function(event) {
      if (event) {
        event.preventDefault();
      }

      if (this.cancelUrl) {
        navigator.visit(this.cancelUrl, {replace: true});
      } else {
        navigator.mainHome({replace: true});
      }
    },


    onDelete: function(event) {
      event.preventDefault();
      var deleteButton = $(event.currentTarget);
      deleteButton.blur();

      if (confirmer("Are you sure to delete this special request?")) {
        var that = this;

        that.$("#cart-specialrequest-form").addClass("loading");

        cartHelper.deleteSpecialRequest(
          deleteButton.data("specialRequestId"),

          // success callback
          function() {
            if (that.cancelUrl) {
              navigator.visit(that.cancelUrl, {replace: true});
            } else {
              navigator.mainHome({replace: true});
            }
          },

          // error callback
          function() {
            var errorMessage = "[view/cart/special_request] - fail to delete a special request.";
            logger(errorMessage);
            errorHandler(errorMessage);
          }
        );
      }
    },


    remove: function() {
      if (this.specialRequestForm) {
        this.specialRequestForm.form("destroy");
      }
      Backbone.View.prototype.remove.call(this);
    }
  });


  return cartSpecialrequestView;
});
