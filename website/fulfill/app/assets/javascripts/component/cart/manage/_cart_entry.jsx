modulejs.define("component/cart/manage/_cart_entry", [
  "alerter",
  "logger",
  "react",
  "app/constant",
  "app/precompiled_asset",
  "app/cached_request",
  "app/cookie",
  "app/navigator",
  "app/utility",
  "helper/cart"
], function(alerter, logger, React, constant, precompiledAsset, cachedRequest, cookie, navigator, utility, cartHelper) {
  "use strict";


  var CartManageCartentryComponent = React.createClass({
    render() {
      var cartEntry = this.state.cartEntry;
      var cartEntryRemoved = false;

      if (cartEntry) {
        var metaPart = null;
        var descriptionPart = null;
        var addButton = null;
        var subtractButton = null;

        var itemSizeInfo = null;
        var pricePerLb = null;
        var estimatedWeight = cartEntry.itemEstimatedWeight;
        if (cartEntry.itemHasFixedSize ===  true) {
          itemSizeInfo = <div className="haigy-padding-b-5px"><i>{cartEntry.itemSize}</i></div>;
        } else if (cartEntry.itemUnit !== constant.item.UNIT_PER_LB && estimatedWeight) {
          if (cartEntry.inStock && estimatedWeight > 0.0 && cartEntry.unitPrice > 0.0) {
            pricePerLb = <span> &#160; (~ ${(cartEntry.unitPrice / estimatedWeight).toFixed(2)} per lb)</span>;
          }
          itemSizeInfo = (<div className="haigy-padding-b-5px"><i>~ {estimatedWeight.toFixed(2)} lb each</i></div>);
        }

        if (cartEntry.inStock === true) {
          var unitPrice = cartEntry.unitPrice;
          var quantity = parseFloat(cartEntry.quantity);
          if (isNaN(quantity)) {quantity = 0;}
          if (quantity === 0.0) {cartEntryRemoved = true;}

          var unitPricePart = null;
          var totalPricePart = null;

          if (unitPrice > 0.0) {
            if (cartEntry.onSale) {
              unitPricePart = (
                <span>
                  <span className="haigy-font-color-red">${unitPrice.toFixed(2)}</span>
                  <span><del>${cartEntry.regularUnitPrice.toFixed(2)}</del></span>
                  <span>{cartEntry.itemUnit}</span>
                </span>
              );
            } else {
              unitPricePart = ["$", unitPrice.toFixed(2), " ", cartEntry.itemUnit].join("");
            }
            totalPricePart = ["$", (unitPrice * quantity).toFixed(2)].join("");
          } else {
            unitPricePart = "Unknown";
            totalPricePart = "Unknown";
          }

          metaPart = (
            <div className="meta">
              <div className="cinema">{itemSizeInfo}</div>
              <div className="cinema">
                {unitPricePart}{pricePerLb}
              </div>
            </div>
          );

          var quantityString = [quantity, " ", constant.item.QUANTITY_UNIT_DISPLAY[cartEntry.itemUnit]].join("");
          var totalEstimatedWeight = null;
          if (cartEntry.itemUnit !== constant.item.UNIT_PER_LB && quantity > 0 && cartEntry.itemHasFixedSize !== true && estimatedWeight) {
            totalEstimatedWeight = <span> &#160; (~ {(estimatedWeight * quantity).toFixed(2)} lb)</span>;
          }
          descriptionPart = (
            <div className="description">
              <div>
                Quantity: {quantityString}{totalEstimatedWeight}
              </div>
              <div>
                Total: {totalPricePart}
              </div>
            </div>
          );

          addButton = (
            <button className="ui animated fade button" onTouchTap={this.addQuantity}>
              <div className="visible content">Add</div>
              <div className="hidden content">
                <i className="plus icon"></i>
              </div>
            </button>
          );

          subtractButton = (
            <button className="ui animated fade button" onTouchTap={this.subtractQuantity}>
              <div className="visible content">Subtract</div>
              <div className="hidden content">
                <i className="minus icon"></i>
              </div>
            </button>
          );
        } else {
          metaPart = (
            <div className="meta">
              <div className="cinema">{itemSizeInfo}</div>
              <div className="cinema">
                <i className="haigy-font-bold haigy-font-color-red">Out of Stock</i>
              </div>
            </div>
          );

          descriptionPart = (
            <div className="description">
              This item will be automatically removed at checkout.
            </div>
          );
        }

        var substitueInfo = null;
        var substituteLookup = cartEntry.itemSubstituteLookup;
        if (substituteLookup && substituteLookup.createdAt) {
          var keywords = substituteLookup.keyword || "";
          if (keywords.length > 50) {
            keywords = [keywords.substr(0, 50), " ..."].join("");
          }
          var currentTime = new Date();
          var currentEpochTime = currentTime.getTime();
          if (substituteLookup.createdAt + constant.item.SUBSTITUTE_LOOKUP_LIFETIME_IN_MILLISECOND < currentEpochTime) {
            substitueInfo = (
              <div>
                <a href={navigator.briefinfoitemSubstitueHash(cartEntry.itemId)} className="haigy-font-color-notice">
                  <div>Substitute In Category: {substituteLookup.categoryName}</div>
                  <div>Lookup Keywords: {keywords}</div>
                  <div>This info is stale. Please click to update.</div>
                </a>
              </div>
            );
          } else {
            substitueInfo = (
              <div>
                <a href={navigator.briefinfoitemSubstitueHash(cartEntry.itemId)}>
                  <div>Substitute In Category: {substituteLookup.categoryName}</div>
                  <div>Lookup Keywords: {keywords}</div>
                  <div>Click to update if needed.</div>
                </a>
              </div>
            );
          }
        } else {
          substitueInfo = (
            <div>
              <a href={navigator.briefinfoitemSubstitueHash(cartEntry.itemId)} className="haigy-font-color-warning">No substitute for this item. Click to set.</a>
            </div>
          );
        }

        return (
          <div className={["item", (cartEntryRemoved ? " haigy-opacity-30" : "")].join("")}>
            <a className="ui small image haigy-position-relative" href={navigator.detailedinfoitemShowHash(cartEntry.itemId)}>
              <img className="haigy-image-overlay" src={utility.imagePathToUrl(cartEntry.itemCoverImagePath)} alt="Item image" />
              <img className="haigy-image-loader" src={precompiledAsset.image.IMAGE_LOADER} alt="Loading ..." />
            </a>
            <div className="content">
              <a className="header" href={navigator.detailedinfoitemShowHash(cartEntry.itemId)}>
                {cartEntry.itemName}
              </a>

              {metaPart}
              {descriptionPart}

              <div className="extra">
                {substitueInfo}

                <div className="ui right floated basic buttons">
                  {addButton}
                  {subtractButton}

                  <button className="ui animated fade button" onTouchTap={this.removeItem}>
                    <div className="visible content">Remove</div>
                    <div className="hidden content">
                      <i className="remove icon"></i>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return null;
      }
    },


    propTypes: {
      cartEntryItemId: React.PropTypes.string,
      onCartEntryRemoved: React.PropTypes.func
    },


    getInitialState() {
      return {
        actionCount: 0,
        cartEntry: cartHelper.getCartEntry(this.props.cartEntryItemId)
      };
    },


    shouldComponentUpdate(nextProps, nextState) {
      return nextState.actionCount != this.state.actionCount;
    },


    addQuantity(event) {
      event.preventDefault();
      event.currentTarget.blur();
      var that = this;
      cartHelper.addItemQuantity(this.props.cartEntryItemId, function(cartEntry) {
        that.setState({actionCount: that.state.actionCount + 1, cartEntry: cartEntry});
      });
    },


    subtractQuantity(event) {
      event.preventDefault();
      event.currentTarget.blur();
      var that = this;
      cartHelper.subtractItemQuantity(this.props.cartEntryItemId, false, function(cartEntry) {
        that.setState({actionCount: that.state.actionCount + 1, cartEntry: cartEntry});
        if (!cartEntry) {
          that.props.onCartEntryRemoved();
        }
      });
    },


    removeItem(event) {
      event.preventDefault();
      event.currentTarget.blur();
      var that = this;

      cartHelper.removeItem(that.props.cartEntryItemId, function() {
        that.setState({actionCount: that.state.actionCount + 1, cartEntry: null});
        that.props.onCartEntryRemoved();
      });
    }
  });


  return CartManageCartentryComponent;
});
