modulejs.define("component/item/fed_but_starving", [
  "logger",
  "react",
  "reactdom",
  "app/cached_request",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "app/utility",
  "app/cookie",
  "model/item",
  "collection/item/fed_but_starving",
  "component/main/_loading",
  "component/item/_single_item"
], function(logger, React, ReactDOM, cachedRequest, constant, navigator, errorHandler, utility, cookie,
  itemModel, itemFedbutstarvingCollection, ComponentMainLoading, ComponentItemSingleitem
) {
  "use strict";


  var ComponentItemFedbutstarving = React.createClass({
    getInitialState: function() {
      return {loading: true, fetchedItems: []};
    },


    render: function() {
      var backToItemManageLink = (
        <div>
          <div><a className="ui blue basic button" href={navigator.itemManageHash(constant.item.ROOT_PARENT_CATEGORY_ITEM_ID)}>Back to Item Manage</a></div>
          <br />
        </div>
      );

      if (this.state.loading) {
        return (<div>{backToItemManageLink} <ComponentMainLoading /></div>);
      } else {
        if (this.state.fetchedItems.length > 0) {
          var selectedStoreId = cookie.getSelectedStoreId();
          var dataFreshTime = dataFreshTime = Date.now() / 1000 - constant.feed.DATA_FRESH_PERIOD_IN_SECOND;

          var itemList = this.state.fetchedItems.map(function(item) {
            return <ComponentItemSingleitem key={item.id} item={item} selectedStoreId={selectedStoreId} dataFreshTime={dataFreshTime} />;
          });

          return (
            <div>
              {backToItemManageLink}

              <div className="ui four stackable doubling cards">
                {itemList}
              </div>
            </div>
          );
        } else {
          return (
            <div>{backToItemManageLink} <h3>Great! No Fed But Starving Item Is Found.</h3></div>
          );
        }
      }
    },


    componentDidMount: function() {
      var that = this;

      cachedRequest.fetchCollection(itemFedbutstarvingCollection, {}, {
        success: function(fetchedItems) {
          that.setState({loading: false, fetchedItems: fetchedItems});
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[view/item/uncategorized] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });
    }
  });


  return ComponentItemFedbutstarving;
});
