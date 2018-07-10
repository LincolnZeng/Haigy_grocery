modulejs.define("component/brief_info_item/_item_list", [
  "alerter",
  "react",
  "material_ui",
  "component/main/_loading",
  "component/brief_info_item/_category_path",
  "component/brief_info_item/_item_card",
  "app/navigator"
], function(alerter, React, MaterialUi, MainLoadingComponent, BriefinfoitemCategorypathComponent,
  BriefinfoitemItemcardComponent, navigator
) {
  "use strict";


  const SORT_BY_DEFAULT_OPTION_VALUE = "relevance";
  const SORT_BY_NAME_OPTION_VALUE = "name";
  const SORT_BY_PRICE_OPTION_VALUE = "price";


  const BriefinfoitemItemlistComponent = React.createClass({
    propTypes: {
      categoryPath: React.PropTypes.array.isRequired,
      allItems: React.PropTypes.array.isRequired,
      showLoadMoreButton: React.PropTypes.bool,
      loadMoreButtonText: React.PropTypes.string,
      loadMoreCallback: React.PropTypes.func,
      beforeSortBy: React.PropTypes.func,
      showMarketingInfo: React.PropTypes.bool
    },


    getDefaultProps: function() {
      return {
        showLoadMoreButton: false,
        loadMoreButtonText: "Click to View More",
        loadMoreCallback: function() {},
        beforeSortBy: function(successCallback, errorCallback) {if (successCallback) {successCallback();} else if (errorCallback) {errorCallback();}},
        showMarketingInfo: false
      };
    },


    getInitialState() {
      return {
        sortByLoading: false,
        loadingMore: false,
        sortByOptionValue: SORT_BY_DEFAULT_OPTION_VALUE,
        allItemsToDisplay: [],
        allCategories: [],
        allGroceries: []
      };
    },


    render() {
      const MenuItem = MaterialUi.MenuItem;
      const SelectField = MaterialUi.SelectField;

      var marketInfo = null;
      if (this.props.showMarketingInfo) {
        marketInfo = (
          <div className="ui piled segment haigy-text-align-center" style={{marginBottom: "25px"}}><i>
            <div><strong className="haigy-font-color-blue">Only $2.99 per delivery &#183; Free delivery on first 3 orders</strong></div>
            <div className="haigy-padding-t-5px"><strong className="haigy-font-color-purple">Haigy keeps adding new grocery items</strong></div>
            <div><strong className="haigy-font-color-purple">Cannot find your desired items? </strong><a href={navigator.mainHowhaigyworksHash}>Click here</a></div>
            <div className="haigy-padding-t-5px"><strong className="haigy-font-color-red">This is only a demonstration website. No order will be delivered.</strong></div>
            <div><strong className="haigy-font-color-red">This is only a demonstration website. No order will be delivered.</strong></div>
            <div><strong className="haigy-font-color-red">This is only a demonstration website. No order will be delivered.</strong></div>
          </i></div>
        );
      }

      var allItems = this.state.allItemsToDisplay;
      var categoryPath = this.props.categoryPath;
      var categoryPathLength = categoryPath.length;

      var categoryPathContent = null;
      var sortByOptions = null;
      var itemListContent = null;
      var loadMoreButton = null;
      var nothingFoundReminder = <div className="haigy-text-align-center"><br /><br />Oops, nothing is found here ...</div>;

      if (categoryPathLength > 0) {
        if (categoryPathLength > 1) {
          categoryPathContent = <BriefinfoitemCategorypathComponent categoryPath={categoryPath} />;
        }

        if (allItems.length > 0) {
          var sortByMenus = [
            <MenuItem value={SORT_BY_DEFAULT_OPTION_VALUE} label="Sorted By Relevance" primaryText="Sort By Relevance" />,
            <MenuItem value={SORT_BY_NAME_OPTION_VALUE} label="Sorted By Name" primaryText="Sort By Name" />
          ];
          if (this.state.allGroceries.length > 0) {
            sortByMenus.push(<MenuItem value={SORT_BY_PRICE_OPTION_VALUE} label="Sorted By Price" primaryText="Sort By Price" />);
          }

          sortByOptions = (
            <div className="haigy-width-100-percent haigy-text-align-right" style={{marginTop: "-18px", marginBottom: "12px"}}>
              <div className="haigy-display-inline-block haigy-text-align-left">
                <SelectField
                  value={this.state.sortByOptionValue}
                  autoWidth={true}
                  onChange={this.onSortByChange}
                  labelStyle={{color: "#666", fontSize: "small", fontStyle: "italic", top: "-1px"}}
                  style={{width: "190px"}}
                >
                  {sortByMenus}
                </SelectField>
              </div>
            </div>
          );

          if (this.state.sortByLoading) {
            itemListContent = <MainLoadingComponent />;
          } else {
            var allItemCards = allItems.map(function(item) {
              return <BriefinfoitemItemcardComponent key={item.id} item={item} />;
            });

            if (this.props.showLoadMoreButton) {
              if (this.state.loadingMore) {
                loadMoreButton = <MainLoadingComponent />;
              } else {
                loadMoreButton = (
                  <div className="ui centered one column grid"><div className="twelve wide column">
                    <button className="ui large fluid basic button" onClick={this.loadMore}><strong><i className="plus icon"></i> {this.props.loadMoreButtonText}</strong></button><br />
                  </div></div>
                );
              }
            }

            itemListContent = (
              <div id="biitem-cbc-all-item-container" className="ui centered cards">
                {allItemCards}
              </div>
            );
          }
        } else {
          itemListContent = nothingFoundReminder;
        }

      } else {
        itemListContent = nothingFoundReminder;
      }

      return (
        <div>
          {marketInfo}
          {categoryPathContent}
          {sortByOptions}
          {itemListContent}
          <br /><br /><br />
          {loadMoreButton}
        </div>
      );
    },


    componentWillMount() {
      this.getItemData(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.getItemData(nextProps);
    },


    getItemData(props) {
      var allItems = props.allItems;
      var categories = [];
      var groceries = [];
      var allItemsCount = allItems.length;
      for (var index = 0; index < allItemsCount; ++index) {
        if (allItems[index].get("is_category")) {
          categories.push(allItems[index]);
        } else {
          groceries.push(allItems[index]);
        }
      }
      this.setState({allItemsToDisplay: allItems, allCategories: categories, allGroceries: groceries});
    },


    loadMore(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.setState({loadingMore: true});
      this.props.loadMoreCallback();
    },


    onSortByChange(event, selectionIndex, selectionValue) {
      var that = this;

      switch (selectionValue) {
      case SORT_BY_NAME_OPTION_VALUE:
        that.setState({sortByLoading: true, sortByOptionValue: SORT_BY_NAME_OPTION_VALUE});
        that.props.beforeSortBy(function() {
          that.setState({sortByLoading: false, allItemsToDisplay: that.props.allItems.slice().sort(function(first, second) {
            var firstName = first.get("name") || "";
            var secondName = second.get("name") || "";
            if (firstName < secondName) {
              return -1;
            } else if (firstName > secondName) {
              return 1;
            } else {
              return 0;
            }
          })});
        }, function() {
          alerter("Some unexpected error happened, cannot sort by name. Sorry for the inconvenience");
          that.setState({sortByLoading: false, sortByOptionValue: SORT_BY_DEFAULT_OPTION_VALUE, allItemsToDisplay: that.props.allItems});
        });
        break;
      case SORT_BY_PRICE_OPTION_VALUE:
        that.setState({sortByLoading: true, sortByOptionValue: SORT_BY_PRICE_OPTION_VALUE});
        that.props.beforeSortBy(function() {
          var allGroceries = that.state.allGroceries.slice();
          allGroceries.sort(function(first, second) {
            var firstItemStoreInfo = first.get("store_item_info") || {};
            var secondItemStoreInfo = second.get("store_item_info") || {};
            var firstPrice = firstItemStoreInfo.price || 0.0;
            var secondPrice = secondItemStoreInfo.price || 0.0;
            if (firstItemStoreInfo.on_sale) {
              firstPrice = firstItemStoreInfo.sale_price || 0.0;
            }
            if (secondItemStoreInfo.on_sale) {
              secondPrice = secondItemStoreInfo.sale_price || 0.0;
            }
            return firstPrice - secondPrice;
          });
          that.setState({sortByLoading: false, allItemsToDisplay: that.state.allCategories.concat(allGroceries)});
        }, function() {
          alerter("Some unexpected error happened, cannot sort by price. Sorry for the inconvenience.");
          that.setState({sortByLoading: false, sortByOptionValue: SORT_BY_DEFAULT_OPTION_VALUE, allItemsToDisplay: that.props.allItems});
        });
        break;
      default:
        that.setState({sortByLoading: true, sortByOptionValue: SORT_BY_DEFAULT_OPTION_VALUE});
        that.setState({sortByLoading: false, allItemsToDisplay: that.props.allItems});
      }
    }
  });


  return BriefinfoitemItemlistComponent;
});
