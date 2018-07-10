modulejs.define("component/detailed_info_item/show", [
  "logger",
  "jquery",
  "react",
  "material_ui",
  "lib/image_zoomer",
  "app/constant",
  "app/precompiled_asset",
  "app/utility",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "app/analytics",
  "helper/cart",
  "helper/item",
  "model/detailed_info_item",
  "component/main/_loading",
  "component/brief_info_item/_category_path"
], function(logger, $, React, MaterialUi, imageZoomer, constant,
  precompiledAsset, utility, cachedRequest, navigator, errorHandler, analytics,
  cartHelper, itemHelper, detailedinfoitemModel, MainLoadingComponent,
  BriefinfoitemCategorypathComponent
) {
  "use strict";


  const ItemInfoEntry = React.createClass({
    render() {
      var text = this.props.text;
      if (text && text.trim().length > 0) {
        return (
          <div>
            <h4 className="ui dividing header">this.props.header</h4>
            <div>{text}</div>
            <br />
          </div>
        );
      } else {
        return null;
      }
    }
  });


  const ThumbImage = React.createClass({
    render() {
      return <img className="ui image haigy-cursor-pointer" src={this.props.src} alt="item image" onClick={this.onClick} />;
    },


    onClick() {
      this.props.onShowLargeImage(this.props.largeImageUrl);
    }
  });


  const DetailedinfoitemShowComponent = React.createClass({
    currentImageZoomer: null,


    propTypes: {
      options: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired
      })
    },


    getInitialState() {
      return {
        loading: true,
        item: null,
        quantityInCart: 0,
        largeImageUrl: null,
        showLargeImageZoomer: false
      };
    },


    render() {
      const Dialog = MaterialUi.Dialog;
      var categoryPath = null;
      var content = null;

      if (this.state.loading === true) {
        content = <MainLoadingComponent />;
      } else {
        var item = this.state.item;
        if (item.id && !item.get("is_category")) {
          var itemUnit= item.get("unit");
          var itemHasFixedSize = item.get("has_fixed_item_size") ===  true;
          var itemStoreInfo = item.get("store_item_info");
          var itemPriceDetails = itemHelper.getItemPriceDetails(itemUnit, itemHasFixedSize, itemStoreInfo);

          categoryPath = item.get("category_path");
          var otherImages = item.get("item_image");
          var otherImagesCount = otherImages.length;

          var itemOtherImagesInfo = null;
          if (otherImagesCount > 0) {
            var that = this;
            itemOtherImagesInfo = (
              <div className="ui piled segment"><div className="ui tiny images haigy-text-align-center">
                <ThumbImage key={[item.id, "_cover_image"].join("")} src={utility.imagePathToUrl(item.get("cover_image_path"))} largeImageUrl={utility.imagePathToUrl(item.get("large_cover_image_path"))} onShowLargeImage={this.showLargeImage} />
                {
                  otherImages.map(function(image) {
                    return <ThumbImage key={image.id} src={utility.imagePathToUrl(image.thumb_path)} largeImageUrl={utility.imagePathToUrl(image.medium_path)} onShowLargeImage={that.showLargeImage} />;
                  })
                }
              </div></div>
            );
          }

          var produceImageWarning = null;
          if (item.get("is_produce") === true) {
            produceImageWarning = (
              <div>
                <span className="haigy-font-color-notice">* Produce pictures are only for reference. The produce you get might look slightly different.</span>
              </div>
            );
          }

          var itemSizeInfo = null;
          if (itemHasFixedSize) {
            itemSizeInfo = <div className="haigy-padding-t-15px haigy-font-color-gray">{item.get("item_size")}</div>;
          } else if (itemPriceDetails.estimatedWeight > 0) {
            var pricePerLb = null;
            if (itemPriceDetails.estimatedCurrentPricePerLb > 0) {
              pricePerLb = <div>~ ${itemPriceDetails.estimatedCurrentPricePerLb.toFixed(2)} per lb</div>;
            }
            itemSizeInfo = (
              <div className="haigy-padding-t-15px haigy-font-color-gray"><i>
                <div>estimate {itemPriceDetails.estimatedWeight.toFixed(2)} lb each</div>
                {pricePerLb}
              </i></div>
            );
          }

          var itemPriceInfo = null;
          var itemPriceSourceInfo = null;

          if (itemPriceDetails.inStock) {
            var itemOnSaleInfo = null;
            if (itemPriceDetails.onSale) {
              itemOnSaleInfo = (
                <div>
                  <span className="biitem-on-sale-price haigy-padding-r-5px">${itemPriceDetails.salePrice.toFixed(2)}</span>
                  <span className="haigy-padding-r-5px"><del>${itemPriceDetails.price.toFixed(2)}</del></span>
                  <span>{itemUnit}</span>
                </div>
              );
            } else {
              itemOnSaleInfo = (
                <div>
                  <span className="haigy-padding-r-5px">${itemPriceDetails.price.toFixed(2)}</span>
                  <span>{itemUnit}</span>
                </div>
              );
            }

            if (itemPriceDetails.storeIsHaigyBase === false) {
              itemPriceSourceInfo = (
                <div className="haigy-padding-t-15px haigy-font-color-gray">
                  <i>
                    We will buy this item from
                    <strong className="haigy-font-color-wholefoods-green"> {itemPriceDetails.storeName} </strong>
                    for you.
                  </i>
                </div>
              );
            }

            itemPriceInfo = (
              <div className="haigy-padding-t-25px haigy-font-size-120">
                {itemOnSaleInfo}
              </div>
            );
          } else {
            itemPriceInfo = <div className="haigy-padding-t-15px">Out of Stock</div>;
          }

          var itemCartOperations = null;
          if (this.state.quantityInCart > 0) {
            var estimatedTotalWeight = null;
            if (itemPriceDetails.estimatedWeight > 0) {
              estimatedTotalWeight = <span> &#160; (~ {(itemPriceDetails.estimatedWeight * this.state.quantityInCart).toFixed(2)} lb)</span>;
            }

            itemCartOperations = (
              <div className="ui card">
                <div className="content">{this.state.quantityInCart} {constant.item.QUANTITY_UNIT_DISPLAY[itemUnit]} in cart{estimatedTotalWeight}</div>
                <div className="extra content">
                  <div className="ui basic buttons">
                    <button className="ui animated fade button" onClick={this.addItemQuantity}>
                      <div className="visible content">Add</div>
                      <div className="hidden content">
                        <i className="plus icon"></i>
                      </div>
                    </button>
                    <button className="ui animated fade button" onClick={this.subtractItemQuantity}>
                      <div className="visible content">Subtract</div>
                      <div className="hidden content">
                        <i className="minus icon"></i>
                      </div>
                    </button>
                    <button className="ui animated fade button" onClick={this.removeItem}>
                      <div className="visible content">Remove</div>
                      <div className="hidden content">
                        <i className="remove icon"></i>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          } else {
            itemCartOperations = (
              <div>
                <button className="ui green button" onClick={this.addItemQuantity}>
                  Add to cart
                </button>
              </div>
            );
          }

          var largeImage = null;
          if (this.state.largeImageUrl) {
            largeImage = (
              <div className="haigy-image-overlay">
                <img className="ui image haigy-image-max-fluid haigy-cursor-pointer" src={this.state.largeImageUrl} alt="item image" onClick={this.showLargeImageZoomer} />
              </div>
            );
          }

          content = (
            <div className="ui stackable grid">
              <div className="mobile only row">
                <div className="column">
                  <h2 className="ui header">{item.get("name")}</h2>
                </div>
              </div>

              <div className="six wide column">
                <div className="haigy-position-relative">
                  {largeImage}
                  <div className="haigy-image-loader">
                    <img className="ui image haigy-image-max-fluid" src={precompiledAsset.image.IMAGE_LOADER} alt="Loading ..." />
                  </div>
                </div>

                {itemOtherImagesInfo}
                {produceImageWarning}
              </div>

              <div className="tablet computer only one wide column"></div>

              <div className="nine wide column">
                <div className="ui grid">
                  <div className="tablet computer only column">
                    <h2 className="ui header">{item.get("name")}</h2>
                  </div>
                </div>

                {itemPriceInfo}
                {itemSizeInfo}
                {itemPriceSourceInfo}

                <br /><br />
                {itemCartOperations}
                <br />

                <ItemInfoEntry header="Warnings" text={item.get("warnings")} />
                <ItemInfoEntry header="Directions" text={item.get("directions")} />
                <ItemInfoEntry header="Ingredients" text={item.get("ingredients")} />
                <ItemInfoEntry header="Details" text={item.get("details")} />

                <Dialog
                  open={this.state.showLargeImageZoomer}
                  onRequestClose={this.closeLargeImageZoomer}
                  autoDetectWindowHeight={false}
                  style={constant.materialUi.DIALOG_STYLE}
                >
                  <div className="haigy-position-relative">
                    <div className="haigy-image-overlay">
                      <img className="ui image haigy-image-max-fluid" src={this.state.largeImageUrl} alt="image" ref={this.createCurrentImageZoomer} />
                    </div>
                    <div className="haigy-image-loader">
                      <img className="ui image haigy-image-max-fluid" src={precompiledAsset.image.IMAGE_LOADER} alt="Loading ..." />
                    </div>
                  </div>
                </Dialog>
              </div>
            </div>
          );
        } else {
          content = <div>Sorry, cannot find the item ...</div>;
        }
      }

      return (
        <div>
          <BriefinfoitemCategorypathComponent categoryPath={categoryPath} linkLastCategory={true} />
          {content}
        </div>
      );
    },


    getItemData(itemId) {
      var that = this;
      var zipCode = cartHelper.getZipCode();

      cachedRequest.fetchModel(detailedinfoitemModel, itemId, {
        fetchParameters: {zip_code: zipCode},

        success: function(fetchedItem) {
          var quantityInCart = cartHelper.getItemQuantityInCart(itemId);
          analytics.browsingItem(fetchedItem.get("name"));
          that.setState({
            loading: false,
            item: fetchedItem,
            quantityInCart: quantityInCart,
            largeImageUrl: utility.imagePathToUrl(fetchedItem.get("large_cover_image_path"))
          });
        },

        error: function(model, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
        }
      });
    },


    componentWillMount() {
      this.getItemData(this.props.options.id);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getItemData(nextProps.options.id);
    },


    componentWillUnmount() {
      this.destroyCurrentImageZoomer();
    },


    addItemQuantity: function(event) {
      var that = this;
      event.currentTarget.blur();
      cartHelper.addItemQuantity(that.state.item.id, function(cachedCartEntry) {
        that.setState({quantityInCart: cachedCartEntry.quantity});
      });
    },


    subtractItemQuantity: function(event) {
      var that = this;
      event.currentTarget.blur();
      cartHelper.subtractItemQuantity(that.state.item.id, true, function(cachedCartEntry) {
        var newQuantity = 0;
        if (cachedCartEntry) {
          newQuantity = cachedCartEntry.quantity;
        }
        that.setState({quantityInCart: newQuantity});
      });
    },


    removeItem: function(event) {
      var that = this;
      event.currentTarget.blur();
      cartHelper.removeItem(that.state.item.id, function(cachedCartEntry) {
        var newQuantity = 0;
        if (cachedCartEntry) {
          newQuantity = cachedCartEntry.quantity;
        }
        that.setState({quantityInCart: newQuantity});
      });
    },


    showLargeImage: function(largeImageUrl) {
      this.setState({largeImageUrl});
    },


    showLargeImageZoomer: function() {
      this.setState({showLargeImageZoomer: true});
    },


    closeLargeImageZoomer: function() {
      this.destroyCurrentImageZoomer();
      this.setState({showLargeImageZoomer: false});
    },


    createCurrentImageZoomer: function(zoomImage) {
      if (zoomImage) {
        this.currentImageZoomer = new imageZoomer($(zoomImage), {listenToWindowResize: true});
      } else {
        this.destroyCurrentImageZoomer();
      }
    },


    destroyCurrentImageZoomer: function() {
      if (this.currentImageZoomer) {
        this.currentImageZoomer.destroy();
      }
    }
  });


  return DetailedinfoitemShowComponent;
});