// This is an auto generated file. Please don't modify it directly. Run "rake haigy_route:generate_navigator" instead to update it.
modulejs.define("app/navigator", ["underscore", "backbone"], function(_, Backbone) {
  "use strict";


  var backboneNavigate = function(urlHash, options) {
    options = _.extend({trigger: true}, options);
    Backbone.history.navigate(urlHash, options);
  };


  var navigator = {
    current: function() {
      var hashFragment = Backbone.history.getFragment();
      if (hashFragment && hashFragment.length > 0) {
        return ["#", hashFragment].join("");
      } else {
        return "#";
      }
    },


    tmp: function() {
      this.visit("#tmp", {trigger: false, replace: true});
    },


    refresh: function() {
      var currentUrlHash = this.current();
      this.tmp();
      this.visit(currentUrlHash, {replace: true});
    },


    visit: function(urlHash, options) {
      backboneNavigate(urlHash, options);
    },


    back: function() {
      Backbone.history.history.back();
    },


    mainHomeHash: "#",
    mainHome: function(options) {
      backboneNavigate(this.mainHomeHash, options);
    },


    mainErrorHash: function(errorMessage) {
      return ["#main/error/", encodeURIComponent(errorMessage)].join("");
    },
    mainError: function(errorMessage, options) {
      backboneNavigate(this.mainErrorHash(errorMessage), options);
    },


    servablezipcodeIndexHash: "#servableZipCodes/index",
    servablezipcodeIndex: function(options) {
      backboneNavigate(this.servablezipcodeIndexHash, options);
    },


    employeeIndexHash: "#employees/index",
    employeeIndex: function(options) {
      backboneNavigate(this.employeeIndexHash, options);
    },


    employeeNewHash: "#employees/new",
    employeeNew: function(options) {
      backboneNavigate(this.employeeNewHash, options);
    },


    employeeShowHash: function(id) {
      return ["#employee/", encodeURIComponent(id), "/show"].join("");
    },
    employeeShow: function(id, options) {
      backboneNavigate(this.employeeShowHash(id), options);
    },


    employeeEditHash: function(id) {
      return ["#employee/", encodeURIComponent(id), "/edit"].join("");
    },
    employeeEdit: function(id, options) {
      backboneNavigate(this.employeeEditHash(id), options);
    },


    companyIndexHash: "#companies/index",
    companyIndex: function(options) {
      backboneNavigate(this.companyIndexHash, options);
    },


    companyNewHash: "#companies/new",
    companyNew: function(options) {
      backboneNavigate(this.companyNewHash, options);
    },


    companySelectHash: "#companies/select",
    companySelect: function(options) {
      backboneNavigate(this.companySelectHash, options);
    },


    companyShowHash: function(id) {
      return ["#company/", encodeURIComponent(id), "/show"].join("");
    },
    companyShow: function(id, options) {
      backboneNavigate(this.companyShowHash(id), options);
    },


    companyEditHash: function(id) {
      return ["#company/", encodeURIComponent(id), "/edit"].join("");
    },
    companyEdit: function(id, options) {
      backboneNavigate(this.companyEditHash(id), options);
    },


    storeIndexHash: "#stores/index",
    storeIndex: function(options) {
      backboneNavigate(this.storeIndexHash, options);
    },


    storeForcompanyHash: function(companyId) {
      return ["#stores/forCompany/", encodeURIComponent(companyId)].join("");
    },
    storeForcompany: function(companyId, options) {
      backboneNavigate(this.storeForcompanyHash(companyId), options);
    },


    storeNewHash: function(companyId) {
      return ["#stores/new/", encodeURIComponent(companyId)].join("");
    },
    storeNew: function(companyId, options) {
      backboneNavigate(this.storeNewHash(companyId), options);
    },


    storeSelectHash: function(redirectUrlHash) {
      return ["#stores/select/", encodeURIComponent(redirectUrlHash)].join("");
    },
    storeSelect: function(redirectUrlHash, options) {
      backboneNavigate(this.storeSelectHash(redirectUrlHash), options);
    },


    storeShowHash: function(id) {
      return ["#store/", encodeURIComponent(id), "/show"].join("");
    },
    storeShow: function(id, options) {
      backboneNavigate(this.storeShowHash(id), options);
    },


    storeEditHash: function(id) {
      return ["#store/", encodeURIComponent(id), "/edit"].join("");
    },
    storeEdit: function(id, options) {
      backboneNavigate(this.storeEditHash(id), options);
    },


    itemManageHash: function(parentCategoryItemId) {
      return ["#items/manage/", encodeURIComponent(parentCategoryItemId)].join("");
    },
    itemManage: function(parentCategoryItemId, options) {
      backboneNavigate(this.itemManageHash(parentCategoryItemId), options);
    },


    itemNewcategoryHash: function(parentCategoryItemId) {
      return ["#items/newCategory/", encodeURIComponent(parentCategoryItemId)].join("");
    },
    itemNewcategory: function(parentCategoryItemId, options) {
      backboneNavigate(this.itemNewcategoryHash(parentCategoryItemId), options);
    },


    itemNewitemHash: function(parentCategoryItemId) {
      return ["#items/newItem/", encodeURIComponent(parentCategoryItemId)].join("");
    },
    itemNewitem: function(parentCategoryItemId, options) {
      backboneNavigate(this.itemNewitemHash(parentCategoryItemId), options);
    },


    itemUncategorizedHash: "#items/uncategorized",
    itemUncategorized: function(options) {
      backboneNavigate(this.itemUncategorizedHash, options);
    },


    itemFedbutstarvingHash: "#items/fedButStarving",
    itemFedbutstarving: function(options) {
      backboneNavigate(this.itemFedbutstarvingHash, options);
    },


    itemSearchHash: function(jsonParams) {
      return ["#items/search/", encodeURIComponent(jsonParams)].join("");
    },
    itemSearch: function(jsonParams, options) {
      backboneNavigate(this.itemSearchHash(jsonParams), options);
    },


    itemShowHash: function(id) {
      return ["#item/", encodeURIComponent(id), "/show"].join("");
    },
    itemShow: function(id, options) {
      backboneNavigate(this.itemShowHash(id), options);
    },


    itemEditcategoryHash: function(id) {
      return ["#item/", encodeURIComponent(id), "/editCategory"].join("");
    },
    itemEditcategory: function(id, options) {
      backboneNavigate(this.itemEditcategoryHash(id), options);
    },


    itemEdititemHash: function(id) {
      return ["#item/", encodeURIComponent(id), "/editItem"].join("");
    },
    itemEdititem: function(id, options) {
      backboneNavigate(this.itemEdititemHash(id), options);
    },


    itemMoveHash: function(id, parentCategoryItemId) {
      return ["#item/", encodeURIComponent(id), "/move/", encodeURIComponent(parentCategoryItemId)].join("");
    },
    itemMove: function(id, parentCategoryItemId, options) {
      backboneNavigate(this.itemMoveHash(id, parentCategoryItemId), options);
    },


    storeiteminfoLookupHash: function(itemId) {
      return ["#storeItemInfos/lookUp/", encodeURIComponent(itemId)].join("");
    },
    storeiteminfoLookup: function(itemId, options) {
      backboneNavigate(this.storeiteminfoLookupHash(itemId), options);
    },


    storeiteminfoEditHash: function(id) {
      return ["#storeItemInfo/", encodeURIComponent(id), "/edit"].join("");
    },
    storeiteminfoEdit: function(id, options) {
      backboneNavigate(this.storeiteminfoEditHash(id), options);
    },


    orderIndexHash: "#orders/index",
    orderIndex: function(options) {
      backboneNavigate(this.orderIndexHash, options);
    },


    orderShowHash: function(id) {
      return ["#order/", encodeURIComponent(id), "/show"].join("");
    },
    orderShow: function(id, options) {
      backboneNavigate(this.orderShowHash(id), options);
    },


    feedInstacartHash: "#feeds/instacart",
    feedInstacart: function(options) {
      backboneNavigate(this.feedInstacartHash, options);
    },


    feedbackIndexHash: function(from, to) {
      return ["#feedbacks/index/", encodeURIComponent(from), "/", encodeURIComponent(to)].join("");
    },
    feedbackIndex: function(from, to, options) {
      backboneNavigate(this.feedbackIndexHash(from, to), options);
    },


    analyticalentryIndexHash: function(from, to) {
      return ["#analyticalEntries/index/", encodeURIComponent(from), "/", encodeURIComponent(to)].join("");
    },
    analyticalentryIndex: function(from, to, options) {
      backboneNavigate(this.analyticalentryIndexHash(from, to), options);
    },

  };


  return navigator;
});
