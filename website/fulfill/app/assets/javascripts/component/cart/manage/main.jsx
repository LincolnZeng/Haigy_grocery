modulejs.define("component/cart/manage/main", [
  "alerter",
  "logger",
  "react",
  "material_ui",
  "app/constant",
  "app/cached_request",
  "app/cookie",
  "app/navigator",
  "app/utility",
  "app/error_handler",
  "helper/cart",
  "model/cart",
  "collection/cart_entry/index",
  "component/cart/manage/_cart_entry"
], function(alerter, logger, React, MaterialUi, constant, cachedRequest, cookie, navigator,
  utility, errorHandler, cartHelper, cartModel, cartentryIndexCollection,
  CartManageCartentryComponent
) {
  "use strict";


  var CartManageMainComponent = React.createClass({
    getInitialState() {
      return {
        allItemIds: [],
        loading: false,
        fulfillFinished: false,
        cartSecuredId: ""
      };
    },


    render() {
      const RaisedButton = MaterialUi.RaisedButton;
      const CircularProgress = MaterialUi.CircularProgress;
      var that = this;

      var allCartEntriesPart = null;
      var fulfillFinishedButton = null;
      if (that.state.allItemIds.length > 0) {
        allCartEntriesPart = that.state.allItemIds.map(function(cartEntryItemId) {
          return <CartManageCartentryComponent key={cartEntryItemId} cartEntryItemId={cartEntryItemId} onCartEntryRemoved={that.refreshCart} />;
        });

        fulfillFinishedButton = (
          <div className="haigy-text-align-right">
            <RaisedButton label="All Finished" secondary={true} onTouchTap={that.onFulfillFinished} />
          </div>
        );
      } else {
        allCartEntriesPart = <a href={navigator.mainHomeHash}>No item is in the cart. Click to start shopping for the user.</a>;
      }

      var content = null;
      if (that.state.loading === true) {
        content = (
          <div>
            <div className="haigy-text-align-center">
              <CircularProgress size={0.8} /><br /><i>loading ...</i>
            </div>
          </div>
        );
      } else if (that.state.fulfillFinished === true) {
        content = (
          <div>
            <div className="haigy-text-align-center">
              <h3>The confirm URL for user</h3>
              <br />
              <h3><i className="haigy-font-color-blue">
                {["https://haigy.com/#cart/", that.state.cartSecuredId].join("")}
              </i></h3>
              <br /><br />
              <div>
                <RaisedButton label="Back to Cart" secondary={true} onTouchTap={that.backToCart} />
              </div>
            </div>
          </div>
        );
      } else {
        content = (
          <div>
            <h2>Shopping Cart</h2>
            {fulfillFinishedButton}
            <br />
            <div className="ui divided items">
              {allCartEntriesPart}
            </div>
            <br />
            {fulfillFinishedButton}
          </div>
        );
      }

      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-800px haigy-text-align-left">
            {content}
          </div>
        </div>
      );
    },


    componentWillMount() {
      this.props.options.customizeLayout();
      this.getCartData();
    },


    componentWillReceiveProps() {
      this.props.options.customizeLayout();
      this.setState(this.getInitialState());
      this.getCartData();
    },


    getCartData() {
      if (cartHelper.getCartIdFromCache()) {
        this.setState({allItemIds: cartHelper.getAllItemIdInCartSorted().reverse()});
      } else {
        var that = this;
        that.setState({loading: true});

        cachedRequest.fetchModel(cartModel, cartHelper.getCartIdFromCookie(), {
          success: function(fetchedCart) {
            cookie.clearAllUserRelatedCookie();
            cookie.user.setUserId(fetchedCart.get("user_id"));
            cookie.user.setZipCode(fetchedCart.get("user_zip_code"));
            cookie.user.setNickname(fetchedCart.get("user_nickname"));
            var cart = fetchedCart.get("cart");

            var cartEntryCollection = new cartentryIndexCollection(cart.cart_entry, {cartId: cart.cart_id});
            cartHelper.parseServerResponse(cartEntryCollection);

            navigator.refresh();
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[component/cart/manage/main] - ", jqXHR.responseJSON.error_message].join(""));
          }
        }, true);
      }
    },


    onFulfillFinished() {
      if (cartHelper.isAllItemSubstituteLookupGood()) {
        this.setState({loading: true, fulfillFinished: true, cartSecuredId: ""});

        var that = this;
        cachedRequest.saveModel(cartModel, {id: cartHelper.getCartIdFromCookie(), fulfill_finished: true}, {
          success: function(savedCart) {
            that.setState({loading: false, cartSecuredId: savedCart.get("secured_id")});
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, ["[component/cart/manage/main] - ", jqXHR.responseJSON.error_message].join(""));
          }
        });
      } else {
        alerter("Please make sure all item substitute infos are set and fresh.");
      }
    },


    backToCart: function(event) {
      event.preventDefault();
      this.setState({loading: false, fulfillFinished: false, cartSecuredId: ""});
    },


    refreshCart() {
      this.setState({allItemIds: cartHelper.getAllItemIdInCartSorted().reverse()});
    }
  });


  return CartManageMainComponent;
});
