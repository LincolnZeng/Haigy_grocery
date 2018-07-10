modulejs.define("component/brief_info_item/browse", [
  "logger",
  "react",
  "app/constant",
  "app/cookie",
  "app/cached_request",
  "app/error_handler",
  "app/analytics",
  "app/precompiled_asset",
  "collection/brief_info_item/browse",
  "component/main/_loading",
  "component/brief_info_item/_item_list"
], function(logger, React, constant, cookie, cachedRequest, errorHandler,
  analytics, precompiledAsset, briefinfoitemBrowseCollection,
  MainLoadingComponent, BriefinfoitemItemlistComponent
) {
  "use strict";


  const BriefinfoitemBrowseComponent = React.createClass({
    propTypes: {
      options: React.PropTypes.shape({
        parentCategoryItemId: React.PropTypes.string.isRequired
      })
    },


    getInitialState() {
      return {
        loading: true,
        categoryPath: [],
        allItems: [],
        showLoadMoreButton: false
      };
    },


    render() {
      var content = null;

      if (this.state.loading === true) {
        content = <MainLoadingComponent />;
      } else {
        var homePageInfo = null;
        if (this.props.options.parentCategoryItemId === constant.item.ROOT_PARENT_CATEGORY_ITEM_ID.toString()) {
          homePageInfo = (
            <div>
              <br />

              <div className="haigy-width-100-percent haigy-text-align-center">
                <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-300px haigy-text-align-left haigy-font-italic">
                  <div><i className="checkmark box icon haigy-font-color-green"></i> No minimum order amount required</div>
                  <br />
                  <div><i className="checkmark box icon haigy-font-color-green"></i> No tips and no any hidden fees</div>
                  <br />
                  <div><i className="checkmark box icon haigy-font-color-green"></i> Guaranteed fresh</div>
                  <br />
                  <div><i className="checkmark box icon haigy-font-color-green"></i> Get refund for any produce you don't like</div>
                  <br />
                  <div><i className="checkmark box icon haigy-font-color-green"></i> Next day delivery</div>
                  <br />
                  <div><i className="checkmark box icon haigy-font-color-green"></i> Service area:</div>
                  <div className="haigy-padding-l-40px">
                    <table><tbody>
                      <tr><td className="haigy-padding-r-25px">Emeryville, CA</td><td>Berkeley, CA</td></tr>
                      <tr><td>Albany, CA</td><td>El Cerrito, CA</td></tr>
                    </tbody></table>
                  </div>
                </div>
              </div>

              <br /><br /><br /><br />

              <div className="haigy-width-100-percent haigy-text-align-center">
                <img className="haigy-width-300px" src={precompiledAsset.image.HAIGY_BEAR} alt="Haigy Grocery Delivery" />
              </div>
            </div>
          );
        }

        content = (
          <div>
            <BriefinfoitemItemlistComponent
              categoryPath={this.state.categoryPath}
              allItems={this.state.allItems}
              showLoadMoreButton={this.state.showLoadMoreButton}
              loadMoreButtonText="Click to View All"
              loadMoreCallback={this.loadAll}
              beforeSortBy={this.beforeSortBy}
              showMarketingInfo={true}
            />
            {homePageInfo}
          </div>
        );
      }

      return content;
    },


    getData(parentCategoryItemId) {
      var that = this;

      var zipCode = cookie.user.getShoppingZipCode();

      cachedRequest.fetchCollection(briefinfoitemBrowseCollection, {
        parentCategoryItemId: parentCategoryItemId,
        zipCode: zipCode,
        load: 1   // the first load
      }, {
        success: function(fetchedItems) {
          var showLoadMoreButton = false;
          var allItems = fetchedItems.models;
          if (fetchedItems.hasMoreToLoad) {
            var cachedSecondLoadResults = cachedRequest.getCachedCollection(briefinfoitemBrowseCollection, {
              parentCategoryItemId: parentCategoryItemId,
              zipCode: zipCode,
              load: 2   // the second load
            });
            if (cachedSecondLoadResults) {
              allItems = allItems.concat(cachedSecondLoadResults.models);
            } else {
              showLoadMoreButton = true;
            }
          }

          // ------ analytics begin ------
          var categoryPath = fetchedItems.categoryPath;
          var lastCategoryIndex = categoryPath.length - 1;
          var categoryName = "Unknown";
          if (lastCategoryIndex >= 0) {
            categoryName = categoryPath[lastCategoryIndex].name;
          }
          analytics.browsingCategory(categoryName);
          // ------ analytics end ------

          that.setState({loading: false, categoryPath: fetchedItems.categoryPath, allItems: allItems, showLoadMoreButton: showLoadMoreButton});
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
        }
      });
    },


    componentWillMount() {
      this.getData(this.props.options.parentCategoryItemId);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getData(nextProps.options.parentCategoryItemId);
    },


    loadAll(sortByCallback) {
      var that = this;

      cachedRequest.fetchCollection(briefinfoitemBrowseCollection, {
        parentCategoryItemId: this.props.options.parentCategoryItemId,
        zipCode: cookie.user.getShoppingZipCode(),
        load: 2   // the second load
      }, {
        success: function(fetchedItems) {
          var allItems = that.state.allItems.concat(fetchedItems.models);
          that.setState({allItems: allItems, showLoadMoreButton: false});
          if (sortByCallback) {
            sortByCallback();
          }
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
          if (sortByCallback) {
            sortByCallback();
          }
        }
      });
    },


    beforeSortBy(successCallback) {
      if (this.state.showLoadMoreButton) {
        this.loadAll(successCallback);
      } else {
        successCallback();
      }
    }
  });


  return BriefinfoitemBrowseComponent;
});