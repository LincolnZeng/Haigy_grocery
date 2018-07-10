modulejs.define("view/main/modal_search", [
  "backbone",
  "jst",
  "app/constant",
  "app/navigator"
], function(Backbone, JST, constant, navigator) {
  "use strict";


  var mainModalsearchView = Backbone.View.extend({
    initialize: function() {
      this.searchForm = null;
    },


    tagName: "div",
    className: "ui small modal",


    template: JST["template/main/modal_search"],


    render: function() {
      this.$el.html(this.template());
      this.searchForm = this.$("#main-m-search-form");
      this.initializeSearchForm(this.searchForm);

      return this;
    },


    initializeSearchForm: function(searchForm) {
      var that = this;

      searchForm.form({
        fields: {keyword: "empty"},

        onSuccess: function(event) {
          if (event) {
            event.preventDefault();
          }

          var submitButton = that.$("#main-m-search-submit");
          var cancelButton = that.$("#main-m-search-cancel");
          submitButton.prop("disabled", true);
          cancelButton.prop("disabled", true);
          searchForm.addClass("loading");
          submitButton.addClass("loading disabled");
          cancelButton.addClass("disabled");

          var searchValue = searchForm.form("get values").keyword.trim();
          navigator.briefinfoitemSearch(searchValue);

          return false;
        }
      });
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
        onApprove: function() {
          that.searchForm.form("validate form");
          return false;
        },
      });
      that.$el.modal("show");
    },


    hideModal: function() {
      this.$el.modal("hide");
    },


    events: {
      "click #main-m-search-cancel": "hideModal"
    },


    remove: function() {
      this.hideModal();
      if (this.searchForm) {
        this.searchForm.form("destroy");
      }
      this.$el.modal("destroy");
      this.$el.empty();
      Backbone.View.prototype.remove.call(this);
    }
  });


  return mainModalsearchView;
});
