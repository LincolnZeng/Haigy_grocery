modulejs.define("component/brief_info_item/substitute", [
  "logger",
  "react",
  "material_ui",
  "app/constant",
  "app/precompiled_asset",
  "app/utility",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "helper/cart",
  "model/brief_info_item",
  "collection/brief_info_item/substitute",
  "component/main/_loading",
  "component/cart/show/_cart_entry"
], function(logger, React, MaterialUi, constant, precompiledAsset, utility,
  cachedRequest, navigator, errorHandler, cartHelper, briefinfoitemModel,
  briefinfoitemSubstituteCollection, MainLoadingComponent,
  CartShowCartentryComponent
) {
  "use strict";


  const BriefinfoitemSubstituteComponent = React.createClass({
    propTypes: {
      options: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired
      })
    },


    getInitialState() {
      return {
        loading: true,
        cartEntry: null,
        substituteItems: []
      };
    },


    render() {
      var substitueList = null;

      if (this.state.loading === true) {
        substitueList = <MainLoadingComponent />;
      } else {
        if (this.state.substituteItems.length > 0) {
          var substitueListRows = this.state.substituteItems.map(function(item) {
            var cartEntry = cartHelper.getCartEntry(item.id);
            var cartEntryDisplayedAfterRemoving = null;
            if (cartEntry) {
              cartEntryDisplayedAfterRemoving = cartHelper.getCartEntry(item.id);
              cartEntryDisplayedAfterRemoving.id = null;
              cartEntryDisplayedAfterRemoving.addedByUser = true;
              cartEntryDisplayedAfterRemoving.quantity = 0;
            } else {
              cartEntry = cartHelper.generateCartEntry(
                item.attributes,
                item.get("store_item_info"),
                {
                  id: null,
                  added_by_user: true,
                  quantity: 0
                }
              );
              cartEntryDisplayedAfterRemoving = cartEntry;
            }
            return (
              <CartShowCartentryComponent
                key={item.id}
                cartEntry={cartEntry}
                cartEntryDisplayedAfterRemoving={cartEntryDisplayedAfterRemoving}
                cartEntryItemId={item.id.toString()}
                hasCartOperationButtons={true}
                subtractCouldRemoveZeroQuantityItemFromCart={true}
                highlightRemoveButton={true}
                fadeOutWhenZeroQuantity={false}
                enableRemoveButtonWhenZeroQuantity={false}
              />
            );
          });
          substitueList = (
            <div className="ui divided items">
              {substitueListRows}
            </div>
          );
        } else {
          substitueList = <div>Sorry, we cannot find any substitute for this item ...</div>;
        }
      }

      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-800px haigy-text-align-left">
            <div>
              <a href={navigator.cartManageHash} className="ui tiny circular labeled icon basic button">
                <i className="arrow left icon"></i>
                Back to Shopping Cart
              </a>
            </div>
            <br /><br />

            <div className="ui items">
              <CartShowCartentryComponent
                cartEntry={this.state.cartEntry}
                cartEntryItemId={this.props.options.id}
                hasCartOperationButtons={true}
                subtractCouldRemoveZeroQuantityItemFromCart={false}
              />
            </div>

            <br />
            <h2>Substitutes for this item:</h2>

            <br />
            {substitueList}
          </div>
        </div>
      );
    },


    getItemSubstituteData(itemId) {
      var that = this;

      // only show this page when the item in the cart.
      var cartIdInCache = cartHelper.getCartIdFromCache();
      if (cartIdInCache || cartHelper.isGuestCart()) {
        var cartEntry = cartHelper.getCartEntry(itemId);
        if (cartEntry) {
          this.setState({
            loading: true,
            cartEntry: cartEntry,
            substituteItems: []
          });

          cachedRequest.fetchCollection(briefinfoitemSubstituteCollection, {
            itemId: that.props.options.id,
            zipCode: cartHelper.getZipCode(),
            categoryId: cartEntry.itemSubstituteLookup.categoryId,
            keyword: cartEntry.itemSubstituteLookup.keyword
          }, {
            success: function(fetchedCollection) {
              that.setState({
                loading: false,
                substituteItems: fetchedCollection.models
              });
            },

            error: function(collection, jqXHR) {
              logger(that);
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
              that.setState(that.getInitialState());
            }
          });
        } else {
          navigator.cartManage();
        }
      } else {
        navigator.cartManage();
      }
    },


    componentWillMount() {
      this.getItemSubstituteData(this.props.options.id);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getItemSubstituteData(nextProps.options.id);
    }
  });


  return BriefinfoitemSubstituteComponent;
});