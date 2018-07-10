modulejs.define("component/brief_info_item/_item_card", [
  "react",
  "app/constant",
  "app/precompiled_asset",
  "app/cookie",
  "app/navigator",
  "app/utility",
  "helper/cart",
  "helper/item"
], function(React, constant, precompiledAsset, cookie, navigator, utility, cartHelper, itemHelper) {
  "use strict";


  const BriefinfoitemItemcardComponent = React.createClass({
    propTypes: {
      item: React.PropTypes.shape({
        id: React.PropTypes.oneOfType([
          React.PropTypes.string,
          React.PropTypes.number
        ]).isRequired
      }).isRequired,   // a Backbone model
      cartOperationCallback: React.PropTypes.func
    },


    getDefaultProps() {
      return {
        cartOperationCallback: function() {}
      };
    },


    getInitialState() {
      return {
        actionCount: 0,
        itemCartQuantity: cartHelper.getItemQuantityInCart(this.props.item.id)
      };
    },


    render() {
      var item = this.props.item;
      var isCategory = item.get("is_category") === true;
      var itemName = item.get("name");
      var itemUnit = item.get("unit");
      var itemHasFixedSize = item.get("has_fixed_item_size") === true;
      var itemStoreInfo = item.get("store_item_info");
      var itemPriceDetails = itemHelper.getItemPriceDetails(itemUnit, itemHasFixedSize, itemStoreInfo);

      var colors = constant.item.ITEM_CARD_COLORS;
      var colorCount = colors.length;
      var randomColor = colors[Math.floor((Math.random() * colorCount))];

      var itemPriceInfo = null;
      var itemSizeInfo = null;
      var itemLinkUrl = null;
      var itemCartOperations = null;
      if (isCategory) {
        itemLinkUrl = navigator.briefinfoitemBrowseHash(item.id);
      } else {
        itemLinkUrl = navigator.detailedinfoitemShowHash(item.id);
        var cartOperationButtonClass = "circular right floated ui icon button";

        if (itemPriceDetails.inStock) {
          var priceTag = null;
          if (itemPriceDetails.onSale) {
            priceTag = (
              <span>
                <span className="biitem-on-sale-price haigy-padding-r-5px">${itemPriceDetails.salePrice.toFixed(2)}</span>
                <del> ${itemPriceDetails.price.toFixed(2)}</del>
              </span>
            );
          } else {
            priceTag = <span>${itemPriceDetails.price.toFixed(2)}</span>;
          }
          itemPriceInfo = <div className="description">{priceTag} {itemUnit}</div>;

          if (this.state.itemCartQuantity > 0) {
            itemCartOperations = (
              <div className="extra content">
                <div className="haigy-width-100-percent haigy-text-align-center" style={{height: "35px", lineHeight: "35px"}}>
                  {this.state.itemCartQuantity} {constant.item.QUANTITY_UNIT_DISPLAY[itemUnit]}
                  <button className={cartOperationButtonClass} onClick={this.addQuantity}><i className="plus icon"></i></button>
                  <button className={cartOperationButtonClass} onClick={this.subtractQuantity}><i className="minus icon"></i></button>
                </div>
              </div>
            );
          } else {
            itemCartOperations = (
              <div className="extra content">
                <button className={cartOperationButtonClass} onClick={this.addQuantity}><i className="add to cart icon"></i></button>
              </div>
            );
          }
        } else {
          itemPriceInfo = <div className="description">Out Of Stock</div>;

          itemCartOperations = (
            <div className="extra content">
              <button className={cartOperationButtonClass} disabled><i className="add to cart icon"></i></button>
            </div>
          );
        }

        if (itemHasFixedSize) {
          itemSizeInfo = <div className="meta"><i>{item.get("item_size")}</i></div>;
        } else {
          if (itemPriceDetails.estimatedWeight > 0.0) {
            itemSizeInfo = (
              <div className="meta"><i>
                <div>estimate {itemPriceDetails.estimatedWeight.toFixed(2)} lb each</div>
                <div>~ ${itemPriceDetails.estimatedCurrentPricePerLb.toFixed(2)} per lb</div>
              </i></div>
            );
          }
        }
      }

      var buyFromInfo = null;
      if (!isCategory && itemPriceDetails.storeIsHaigyBase === false) {
        buyFromInfo = (
          <div className="meta">
            <div className="haigy-font-small haigy-padding-t-5px haigy-font-italic">
              from <span className="haigy-font-color-wholefoods-green haigy-font-bold">{itemPriceDetails.storeName}</span>
            </div>
          </div>
        );
      }

      return (
        <div className={[randomColor, " card biitem-small-screen-card-width biitem-wide-screen-card-width"].join("")}>
          <a className="image haigy-position-relative" href={itemLinkUrl}>
            <img className="haigy-image-overlay" src={utility.imagePathToUrl(item.get("cover_image_path"))} alt={itemName} />
            <img className="haigy-image-loader" src={precompiledAsset.image.IMAGE_LOADER} alt="Loading ..." />
          </a>

          <div className="content">
            {itemPriceInfo}
            {itemSizeInfo}
            <div className="description">
              <a href={itemLinkUrl}>{itemName}</a>
            </div>
            {buyFromInfo}
          </div>

          {itemCartOperations}
        </div>
      );
    },


    shouldComponentUpdate(nextProps, nextState) {
      return nextState.actionCount != this.state.actionCount;
    },


    addQuantity(event) {
      event.preventDefault();
      event.currentTarget.blur();
      var that = this;
      var itemId = this.props.item.id;
      cartHelper.addItemQuantity(itemId, function() {
        that.setState({
          actionCount: that.state.actionCount + 1,
          itemCartQuantity: cartHelper.getItemQuantityInCart(itemId)
        });
        that.props.cartOperationCallback();
      });
    },


    subtractQuantity(event) {
      event.preventDefault();
      event.currentTarget.blur();
      var that = this;
      var itemId = this.props.item.id;
      cartHelper.subtractItemQuantity(itemId, true, function() {
        that.setState({
          actionCount: that.state.actionCount + 1,
          itemCartQuantity: cartHelper.getItemQuantityInCart(itemId)
        });
        that.props.cartOperationCallback();
      });
    }
  });


  return BriefinfoitemItemcardComponent;
});
