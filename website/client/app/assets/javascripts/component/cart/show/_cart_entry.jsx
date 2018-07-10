modulejs.define("component/cart/show/_cart_entry", [
  "alerter",
  "logger",
  "react",
  "app/constant",
  "app/precompiled_asset",
  "app/cached_request",
  "app/cookie",
  "app/navigator",
  "app/utility",
  "helper/cart",
  "helper/item"
], function(alerter, logger, React, constant, precompiledAsset,
  cachedRequest, cookie, navigator, utility, cartHelper, itemHelper
) {
  "use strict";


  const CartShowCartentryComponent = React.createClass({
    propTypes: {
      cartEntry: React.PropTypes.object,
      cartEntryDisplayedAfterRemoving: React.PropTypes.object,
      cartEntryItemId: React.PropTypes.string,
      showSubstitute: React.PropTypes.bool,
      hasCartOperationButtons: React.PropTypes.bool,
      subtractCouldRemoveZeroQuantityItemFromCart: React.PropTypes.bool,
      enableRemoveButtonWhenZeroQuantity: React.PropTypes.bool,
      fadeOutWhenZeroQuantity: React.PropTypes.bool,
      cartOperationCallback: React.PropTypes.func
    },


    getDefaultProps() {
      return {
        cartEntryDisplayedAfterRemoving: null,
        showSubstitute: false,
        hasCartOperationButtons: false,
        subtractCouldRemoveZeroQuantityItemFromCart: true,
        enableRemoveButtonWhenZeroQuantity: true,
        fadeOutWhenZeroQuantity: true,
        cartOperationCallback: function() {}
      };
    },


    getInitialState() {
      return {
        actionCount: 0,
        cartEntry: {}
      };
    },


    render() {
      var hasCartOperationButtons = this.props.hasCartOperationButtons;
      var cartEntry = this.state.cartEntry;
      var fadeOutCartEntry = false;

      if (cartEntry) {
        var metaPart = null;
        var descriptionPart = null;
        var addButton = null;
        var subtractButton = null;

        var itemSizeInfo = null;
        var itemPriceDetails = itemHelper.getItemPriceDetailsFromCartEntry(cartEntry);

        if (itemPriceDetails.itemHasFixedSize) {
          itemSizeInfo = <div className="haigy-font-italic">{cartEntry.itemSize}</div>;
        } else if (itemPriceDetails.estimatedWeight > 0) {
          var pricePerLb = null;
          if (itemPriceDetails.estimatedCurrentPricePerLb > 0) {
            pricePerLb = <div>~ ${itemPriceDetails.estimatedCurrentPricePerLb.toFixed(2)} per lb</div>;
          }
          itemSizeInfo = (
            <div className="haigy-font-italic">
              <div>estimate {itemPriceDetails.estimatedWeight.toFixed(2)} lb each</div>
              {pricePerLb}
            </div>
          );
        }

        var unitPricePart = null;
        if (itemPriceDetails.inStock) {
          var quantity = parseFloat(cartEntry.quantity);
          if (isNaN(quantity)) {quantity = 0;}
          if (quantity === 0.0) {fadeOutCartEntry = this.props.fadeOutWhenZeroQuantity;}

          var unitPriceContent = null;
          var totalPricePart = null;

          if (itemPriceDetails.currentPrice > 0) {
            if (itemPriceDetails.onSale) {
              unitPriceContent = (
                <span>
                  <span className="haigy-font-bold haigy-font-italic haigy-font-color-red haigy-padding-t-5px haigy-padding-r-5px">${itemPriceDetails.salePrice.toFixed(2)}</span>
                  <span> <del>${itemPriceDetails.price.toFixed(2)}</del> </span>
                  <span>{itemPriceDetails.itemUnit}</span>
                </span>
              );
            } else {
              unitPriceContent = ["$", itemPriceDetails.price.toFixed(2), " ", cartEntry.itemUnit].join("");
            }
            totalPricePart = ["$", (itemPriceDetails.currentPrice * quantity).toFixed(2)].join("");
          } else {
            unitPriceContent = "Unknown";
            totalPricePart = "Unknown";
          }

          unitPricePart = <div className="description">{unitPriceContent}</div>;

          metaPart = (
            <div className="meta">
              <div className="cinema">{itemSizeInfo}</div>
            </div>
          );

          var quantityString = [quantity, " ", constant.item.QUANTITY_UNIT_DISPLAY[cartEntry.itemUnit]].join("");
          var totalEstimatedWeight = null;
          if (itemPriceDetails.estimatedWeight > 0) {
            totalEstimatedWeight = <span> &#160; (~ {(itemPriceDetails.estimatedWeight * quantity).toFixed(2)} lb)</span>;
          }
          descriptionPart = (
            <div className="description">
              <div><strong>
                Quantity: {quantityString}{totalEstimatedWeight}
              </strong></div>
              <div>
                Total: {totalPricePart}
              </div>
            </div>
          );

          if (hasCartOperationButtons) {
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
          }
        } else {
          metaPart = (
            <div className="meta">
              <div className="cinema">
                <div className="haigy-padding-b-5px">
                  {itemSizeInfo}
                </div>
              </div>
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

        var extraContentPart = null;
        var hasExtraContent = false;
        var cartOperationButtons = null;
        var itemSubstituteLink = null;
        if (this.props.showSubstitute === true) {
          hasExtraContent = true;
          itemSubstituteLink = (
            <div>
              <a href={navigator.briefinfoitemSubstitueHash(cartEntry.itemId)} className="haigy-font-color-purple">
                Click to see substitutes
              </a>
            </div>
          );
        }

        if (hasCartOperationButtons) {
          hasExtraContent = true;
          var removeButton = null;
          var removeButtonEnabled = false;
          if (quantity > 0) {
            removeButtonEnabled = true;
          } else {
            subtractButton = <button className="ui disabled button">Subtract</button>;
            if (cartEntry.addedByUser && this.props.enableRemoveButtonWhenZeroQuantity) {
              removeButtonEnabled = true;
            }
          }
          if (removeButtonEnabled) {
            removeButton = (
              <button className="ui animated fade button" onTouchTap={this.removeItem}>
                <div className="visible content">Remove</div>
                <div className="hidden content">
                  <i className="remove icon"></i>
                </div>
              </button>
            );
          } else {
            removeButton = <button className="ui disabled button">Remove</button>;
          }

          cartOperationButtons = (
            <div className="ui right floated basic buttons">
              {addButton}
              {subtractButton}
              {removeButton}
            </div>
          );
        }

        if (hasExtraContent) {
          extraContentPart = (
            <div className="extra">
              {itemSubstituteLink}
              <br />
              {cartOperationButtons}
            </div>
          );
        }

        var itemImageClass = null;
        var fadeOutContentClass = "";
        if (fadeOutCartEntry) {
          fadeOutContentClass = "haigy-opacity-30";
          itemImageClass = "ui small image haigy-position-relative haigy-opacity-30";
        } else {
          itemImageClass = "ui small image haigy-position-relative";
        }

        return (
          <div className="item">
            <a className={itemImageClass} href={navigator.detailedinfoitemShowHash(cartEntry.itemId)}>
              <img className="haigy-image-overlay" src={utility.imagePathToUrl(cartEntry.itemCoverImagePath)} alt="Item image" />
              <img className="haigy-image-loader" src={precompiledAsset.image.IMAGE_LOADER} alt="Loading ..." />
            </a>

            <div className="content">
              <div className={fadeOutContentClass}>
                <a className="header" href={navigator.detailedinfoitemShowHash(cartEntry.itemId)}>
                  {cartEntry.itemName}
                </a>

                {unitPricePart}
                {metaPart}
                {descriptionPart}
              </div>
              {extraContentPart}
            </div>
          </div>
        );
      } else {
        return null;
      }
    },


    componentWillMount() {
      var cartEntry = this.props.cartEntry || cartHelper.getCartEntry(this.props.cartEntryItemId);
      this.setState({actionCount: this.state.actionCount + 1, cartEntry: cartEntry});
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
        that.props.cartOperationCallback();
      });
    },


    subtractQuantity(event) {
      event.preventDefault();
      event.currentTarget.blur();
      var that = this;
      cartHelper.subtractItemQuantity(this.props.cartEntryItemId, that.props.subtractCouldRemoveZeroQuantityItemFromCart, function(cartEntry) {
        var updatedCartEntry = cartEntry;
        if (!updatedCartEntry) {
          updatedCartEntry = that.props.cartEntryDisplayedAfterRemoving;
        }
        that.setState({actionCount: that.state.actionCount + 1, cartEntry: updatedCartEntry});
        that.props.cartOperationCallback();
      });
    },


    removeItem(event) {
      event.preventDefault();
      event.currentTarget.blur();
      var that = this;
      cartHelper.removeItem(that.props.cartEntryItemId, function(cartEntry) {
        var removedCartEntry = that.props.cartEntryDisplayedAfterRemoving || cartEntry;
        that.setState({actionCount: that.state.actionCount + 1, cartEntry: removedCartEntry});
        that.props.cartOperationCallback();
      });
    }
  });


  return CartShowCartentryComponent;
});
