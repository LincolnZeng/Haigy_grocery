modulejs.define("app/router", [
  "backbone",
  "jquery",
  "react",
  "reactdom",
  "material_ui",
  "app/constant",
  "app/cached_request",
  "app/navigator",
  "app/utility",
  "view/main/layout",
  "view/session/sign_in"
], function(Backbone, $, React, ReactDOM, MaterialUi, constant, cachedRequest, navigator,
  utility, mainLayoutViewDef, sessionSignInViewDef
){
  "use strict";


  const MuiThemeProvider = MaterialUi.MuiThemeProvider;
  var mainLayout = null;
  var mainContentContainer = null;
  var mainNoticeContainer = null;
  var mainLayoutReady = false;
  var currentView = null;


  var router = Backbone.Router.extend({
    routes: {
      "": "mainHome",
      "main/error/:errorMessage": "mainError",

      "servableZipCodes/index": "servablezipcodeIndex",

      "employees/index": "employeeIndex",
      "employees/new": "employeeNew",
      "employee/:id/show": "employeeShow",
      "employee/:id/edit": "employeeEdit",

      "companies/index": "companyIndex",
      "companies/new": "companyNew",
      "companies/select": "companySelect",
      "company/:id/show": "companyShow",
      "company/:id/edit": "companyEdit",

      "stores/index": "storeIndex",
      "stores/forCompany/:companyId": "storeForcompany",
      "stores/new/:companyId": "storeNew",
      "stores/select/:redirectUrlHash": "storeSelect",
      "store/:id/show": "storeShow",
      "store/:id/edit": "storeEdit",

      "items/manage/:parentCategoryItemId": "itemManage",
      "items/newCategory/:parentCategoryItemId": "itemNewcategory",
      "items/newItem/:parentCategoryItemId": "itemNewitem",
      "items/uncategorized": "itemUncategorized",
      "items/fedButStarving": "itemFedbutstarving",
      "items/search/:jsonParams": "itemSearch",
      "item/:id/show": "itemShow",
      "item/:id/editCategory": "itemEditcategory",
      "item/:id/editItem": "itemEdititem",
      "item/:id/move/:parentCategoryItemId": "itemMove",

      "storeItemInfos/lookUp/:itemId": "storeiteminfoLookup",
      "storeItemInfo/:id/edit": "storeiteminfoEdit",

      "orders/index": "orderIndex",
      "order/:id/show": "orderShow",

      "feeds/instacart": "feedInstacart",

      "feedbacks/index/:from/:to": "feedbackIndex",

      "analyticalEntries/index/:from/:to": "analyticalentryIndex"
    },


    execute: function(callback, args) {
      var that = this;

      $(function() {
        if (currentView) {   // prevent memory leak
          currentView.remove();
          currentView = null;
        }

        var token = cachedRequest.tokenHandler.getToken();
        if (token) {
          var tokenHeader = {};
          tokenHeader[constant.session.REQUEST_HEADER_TOKEN_ATTRIBUTE] = token;
          $.ajaxSetup({
            headers: tokenHeader
          });
          if (!mainLayoutReady) {
            mainLayout = new mainLayoutViewDef();
            mainLayout.render();
            $("body").empty();
            $("body").append(mainLayout.$el);
            mainContentContainer = mainLayout.mainContentContainer();
            mainNoticeContainer = mainLayout.mainNoticeContainer();
            mainLayoutReady = true;
          }
          callback.apply(that, args);
        } else {
          if (mainContentContainer) {
            ReactDOM.unmountComponentAtNode(mainContentContainer.get(0));
          }
          if (mainNoticeContainer) {
            ReactDOM.unmountComponentAtNode(mainNoticeContainer.get(0));
          }
          mainLayoutReady = false;
          utility.clearAllCacheAndCookie();
          currentView = new sessionSignInViewDef();
          $("body").empty();
          $("body").append(currentView.render().$el);
        }
      });
    },


    render: function(viewModuleName, options) {
      var viewDef = modulejs.require(viewModuleName);
      currentView = new viewDef(options);
      ReactDOM.unmountComponentAtNode(mainContentContainer.get(0));
      ReactDOM.unmountComponentAtNode(mainNoticeContainer.get(0));
      mainContentContainer.empty();
      mainContentContainer.append(currentView.render().$el);
    },


    reactRender: function(componentModuleName, options) {
      var ComponentDef = modulejs.require(componentModuleName);
      ReactDOM.unmountComponentAtNode(mainContentContainer.get(0));
      ReactDOM.unmountComponentAtNode(mainNoticeContainer.get(0));
      mainContentContainer.empty();
      ReactDOM.render(<MuiThemeProvider muiTheme={MaterialUi.getMuiTheme()}><ComponentDef options={options} /></MuiThemeProvider>, mainContentContainer.get(0));
    },


    mainHome: function() {
      this.render("view/main/home");
    },


    mainError: function(errorMessage) {
      this.render("view/main/error", {
        errorMessage: errorMessage
      });
    },


    servablezipcodeIndex: function() {
      this.render("view/servable_zip_code/index");
    },


    employeeIndex: function() {
      this.render("view/employee/index");
    },


    employeeNew: function() {
      this.render("view/employee/edit");
    },


    employeeShow: function(id) {
      this.render("view/employee/show", {id: id});
    },


    employeeEdit: function(id) {
      this.render("view/employee/edit", {id: id});
    },


    companyIndex: function() {
      this.render("view/company/index");
    },


    companyNew: function() {
      this.render("view/company/edit");
    },


    companySelect: function() {
      this.render("view/company/select");
    },


    companyShow: function(id) {
      this.render("view/company/show", {id: id});
    },


    companyEdit: function(id) {
      this.render("view/company/edit", {id: id});
    },


    storeIndex: function() {
      this.render("view/store/index");
    },


    storeForcompany: function(companyId) {
      this.render("view/store/for_company", {companyId: companyId});
    },


    storeNew: function(companyId) {
      this.render("view/store/edit", {companyId: companyId});
    },


    storeSelect: function(redirectUrlHash) {
      this.render("view/store/select", {redirectUrlHash: redirectUrlHash});
    },


    storeShow: function(id) {
      this.render("view/store/show", {id: id});
    },


    storeEdit: function(id) {
      this.render("view/store/edit", {id: id});
    },


    itemManage: function(parentCategoryItemId) {
      this.render("view/item/manage", {parentCategoryItemId: parentCategoryItemId});
    },


    itemNewcategory: function(parentCategoryItemId) {
      this.render("view/item/edit_category", {parentCategoryItemId: parentCategoryItemId});
    },


    itemNewitem: function(parentCategoryItemId) {
      this.render("view/item/edit_item", {parentCategoryItemId: parentCategoryItemId});
    },


    itemUncategorized: function() {
      this.render("view/item/uncategorized");
    },


    itemFedbutstarving: function() {
      this.reactRender("component/item/fed_but_starving");
    },


    itemSearch: function(jsonParams) {
      this.render("view/item/search", {jsonParams: jsonParams});
    },


    itemShow: function(id) {
      this.render("view/item/show", {id: id});
    },


    itemEditcategory: function(id) {
      this.render("view/item/edit_category", {id: id});
    },


    itemEdititem: function(id) {
      this.render("view/item/edit_item", {id: id});
    },


    itemMove: function(id, parentCategoryItemId) {
      this.render("view/item/move", {id: id, parentCategoryItemId: parentCategoryItemId});
    },


    itemWithbarcode: function(barcode, barcodeType) {
      this.render("view/item/with_barcode", {
        barcode: barcode,
        barcodeType: barcodeType
      });
    },


    storeiteminfoLookup: function(itemId) {
      this.render("view/store_item_info/edit", {
        itemId: itemId
      });
    },


    storeiteminfoEdit: function(id) {
      this.render("view/store_item_info/edit", {
        id: id
      });
    },


    orderIndex: function() {
      this.render("view/order/index");
    },


    orderShow: function(id) {
      this.render("view/order/show", {id: id});
    },


    feedInstacart: function() {
      this.render("view/feed/instacart");
    },


    feedbackIndex: function(from, to) {
      this.reactRender("component/feedback/index", {from: from, to: to});
    },


    analyticalentryIndex: function(from, to) {
      this.render("view/analytical_entry/index", {from: from, to: to});
    }
  });


  return router;
});