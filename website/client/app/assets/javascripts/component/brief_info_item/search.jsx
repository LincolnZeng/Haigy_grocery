modulejs.define("component/brief_info_item/search", [
  "logger",
  "react",
  "app/cookie",
  "app/cached_request",
  "app/error_handler",
  "collection/brief_info_item/search",
  "component/main/_loading",
  "component/brief_info_item/_item_list"
], function(logger, React, cookie, cachedRequest, errorHandler,
  briefinfoitemSearchCollection, MainLoadingComponent,
  BriefinfoitemItemlistComponent
) {
  "use strict";


  const BriefinfoitemSearchComponent = React.createClass({
    page: 1,


    propTypes: {
      options: React.PropTypes.shape({
        keyword: React.PropTypes.string.isRequired
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
        content = (
          <BriefinfoitemItemlistComponent
            categoryPath={this.state.categoryPath}
            allItems={this.state.allItems}
            showLoadMoreButton={this.state.showLoadMoreButton}
            loadMoreButtonText="Click to View More"
            loadMoreCallback={this.loadMore}
            showMarketingInfo={true}
          />
        );
      }

      return content;
    },


    getData(keyword) {
      var that = this;

      var zipCode = cookie.user.getShoppingZipCode();

      cachedRequest.fetchCollection(briefinfoitemSearchCollection, {
        keyword: keyword,
        zipCode: zipCode,
        page: that.page   // the first load
      }, {
        success: function(fetchedItems) {
          var showLoadMoreButton = false;
          var allItems = fetchedItems.models;
          var itemCollection = fetchedItems;
          while (itemCollection && itemCollection.hasMoreToLoad) {
            var nextPageLoadResults = cachedRequest.getCachedCollection(briefinfoitemSearchCollection, {
              keyword: keyword,
              zipCode: zipCode,
              page: that.page + 1   // next load
            });
            itemCollection = nextPageLoadResults;
            if (itemCollection) {
              that.page += 1;
              if (itemCollection.hasMoreToLoad) {
                showLoadMoreButton = true;
              } else {
                showLoadMoreButton = false;
              }
              allItems = allItems.concat(itemCollection.models);
            } else {
              showLoadMoreButton = true;
            }
          }
          that.setState({loading: false, categoryPath: fetchedItems.categoryPath, allItems: allItems, showLoadMoreButton: showLoadMoreButton});
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
        }
      });
    },


    componentWillMount() {
      this.getData(this.props.options.keyword);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getData(nextProps.options.keyword);
    },


    loadMore() {
      var that = this;

      cachedRequest.fetchCollection(briefinfoitemSearchCollection, {
        keyword: this.props.options.keyword,
        zipCode: cookie.user.getShoppingZipCode(),
        page: that.page + 1   // the second load
      }, {
        success: function(fetchedItems) {
          that.page += 1;
          var allItems = that.state.allItems.concat(fetchedItems.models);
          that.setState({allItems: allItems, showLoadMoreButton: fetchedItems.hasMoreToLoad});
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
        }
      });
    }
  });


  return BriefinfoitemSearchComponent;
});