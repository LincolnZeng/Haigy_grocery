modulejs.define("component/item/_single_item", [
  "react",
  "app/navigator",
  "app/utility"
], function(React, navigator, utility) {
  "use strict";


  // props: [item, selectedStoreId, dataFreshTime]
  var ComponentItemSingleitem = React.createClass({
    render: function() {
      var item = this.props.item;
      var selectedStoreId = this.props.selectedStoreId;

      if (item) {
        if (item.get("is_category") === true) {
          return (
            <div className="card">
              <a className="image" href={navigator.itemManageHash(item.id)}>
                <img src={utility.pathToUrl(item.get("cover_image_path"))} alt={[item.get("name"), " Logo"].join("")} />
              </a>

              <div className="content">
                <div>
                  <a href={navigator.itemManageHash(item.id)}>{item.get("name")}</a>
                </div>
                <div className="meta">Display Sequence: {item.get("display_sequence")}</div>
                <br />
                <div>
                  <a href={navigator.itemEditcategoryHash(item.id)}>Edit</a> |
                  <a href={navigator.itemMoveHash(item.id, item.get("parent_category_item_id"))}>Move</a> |
                  <a href={navigator.itemManageHash(item.id)}>View</a>
                </div>
              </div>
            </div>
          );
        } else {
          var itemSize = item.get("has_fixed_item_size") === true ? item.get("item_size") : "varies";

          var storeSelectedComponent = null;
          if (selectedStoreId) {
            var selectedStoreItemInfo = (item.get("store_item_infos") || {})[selectedStoreId.toString()];

            if (selectedStoreItemInfo) {
              var feedMappings = selectedStoreItemInfo.feed_mappings;

              if (feedMappings) {
                var mappingCount = feedMappings.length;
                var feedMappingComponent = null;
                if (mappingCount > 0) {
                  var dataFreshTime = this.props.dataFreshTime || 0;
                  var isDataStale = parseFloat(selectedStoreItemInfo.last_updated_at || 0) < dataFreshTime;
                  var dataStaleClassName = isDataStale ? "haigy-font-color-warning" : "haigy-font-color-success";

                  var feedMappingList = feedMappings.map(function(mapping){
                    return (
                      <div key={mapping.id}>Instacart ID:
                        <i className="haigy-padding-l-5px">
                          <a href={utility.getInstacartItemUrl(mapping.instacart_id)} target="_blank">{mapping.instacart_id}</a>
                        </i>
                      </div>
                    );
                  });

                  feedMappingComponent = (
                    <div>
                      <div>Feed Mappings:</div>
                      <div className={dataStaleClassName}>
                        {feedMappingList}
                      </div>
                    </div>
                  );
                } else {
                  feedMappingComponent = (<div>Feed Mappings Not Set</div>);
                }

                var priceComponent = null;
                if (selectedStoreItemInfo.in_stock === true) {
                  var price = parseFloat(selectedStoreItemInfo.price || 0.0).toFixed(2);
                  if (selectedStoreItemInfo.on_sale === true) {
                    priceComponent = (
                      <div>
                        <div>Sale Price: ${parseFloat(selectedStoreItemInfo.sale_price || 0.0).toFixed(2)}</div>
                        <div>Regular Price: ${price}</div>
                      </div>
                    );
                  } else {
                    priceComponent = (<div>Price: ${price}</div>);
                  }
                } else {
                  priceComponent = (<div>Out of Stock</div>);
                }

                storeSelectedComponent = (
                  <div>
                    {feedMappingComponent}
                    <br />
                    {priceComponent}
                    <br />
                  </div>
                );
              }
            }
          }

          return (
            <div className="card">
              <a className="image" href={navigator.itemShowHash(item.id)}>
                <img src={utility.pathToUrl(item.get("cover_image_path"))} alt={[item.get("name"), " Cover Image"].join("")} />
              </a>

              <div className="content">
                <div><a href={navigator.itemShowHash(item.id)}>{item.get("name")}</a></div>
                <div className="meta">Display Sequence: {item.get("display_sequence")}</div>
                <br />
                <div>Purchase Unit: {item.get("unit")}</div>

                <div>Item Size: {itemSize}</div>

                <br />

                {storeSelectedComponent}

                <div>
                  <a href={navigator.itemMoveHash(item.id, item.get("parent_category_item_id"))}>Move</a> |
                  <a href={navigator.itemShowHash(item.id)}>View</a>
                </div>
              </div>
            </div>
          );
        }
      } else {
        return false;
      }
    }
  });


  return ComponentItemSingleitem;
});
