modulejs.define("view/company/index", [
	"logger",
	"backbone",
	"jquery",
	"jst",
	"app/cached_request",
	"app/utility",
	"app/navigator",
	"app/error_handler",
	"collection/company/index"
], function(logger, Backbone, $, JST, cachedRequest, utility, navigator, errorHandler, companyIndexCollection) {
	"use strict";


	var companyIndexView = Backbone.View.extend({
		mainT: JST["template/company/index"],
		loadingT: JST["template/main/loading"],


		render: function() {
			var that = this;

			that.$el.html(that.loadingT());

			cachedRequest.fetchCollection(companyIndexCollection, {}, {
				success: function(fetchedCollection) {
					that.$el.html(that.mainT({allCompany: fetchedCollection, pathToUrlTool: utility.pathToUrl, navigator: navigator}));
				},

				error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/company/index] - ", jqXHR.responseJSON.error_message].join(""));
				}
			});

			return that;
		}
	});


	return companyIndexView;
});