modulejs.define("component/cart/show/main", [
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
  "helper/session",
  "model/cart",
  "component/main/_loading",
  "component/cart/show/_cart_entry",
  "component/user/_sign_in_form",
  "component/brief_info_item/_category_path"
], function(alerter, logger, React, MaterialUi, constant, cachedRequest, cookie, navigator, utility,
  errorHandler, cartHelper, sessionHelper, cartModel, MainLoadingComponent,
  CartShowCartentryComponent, UserSigninformComponent, BriefinfoitemCategorypathComponent
) {
  "use strict";


  const CartShowMainComponent = React.createClass({
    statics: {
      componentName: constant.specialComponentName.CART_SHOW
    },


    propTypes: {
      options: React.PropTypes.shape({
        id: React.PropTypes.string
      }),
      currentState: React.PropTypes.shape({
        sessionIsUpToDate: React.PropTypes.bool.isRequired
      }),
      getCurrentCartIfCheckedOut: React.PropTypes.bool
    },


    getDefaultProps: function() {
      return {
        getCurrentCartIfCheckedOut: false
      };
    },


    getInitialState() {
      return {
        loading: true,
        fetchingCartData: false,
        hasPermission: true,
        allItemIds: [],
        totalPrice: 0.0
      };
    },


    render() {
      const RaisedButton = MaterialUi.RaisedButton;
      var content = null;

      if (this.state.hasPermission === true) {
        if (this.state.loading === true) {
          content = <MainLoadingComponent />;
        } else {
          if (this.state.allItemIds.length > 0) {
            var that = this;
            var allCartEntriesPart = this.state.allItemIds.map(function(cartEntryItemId) {
              return <CartShowCartentryComponent
                key={cartEntryItemId}
                cartEntryItemId={cartEntryItemId}
                showSubstitute={true}
                hasCartOperationButtons={true}
                subtractCouldRemoveZeroQuantityItemFromCart={false}
                cartOperationCallback={that.updateTotalPrice}
              />;
            });

            var checkoutButton = (
              <div className="haigy-text-align-right haigy-padding-t-10px haigy-padding-b-10px">
                <RaisedButton label="Checkout" secondary={true} onTouchTap={this.checkout} />
              </div>
            );

            var totalPrice = (
              <div className="haigy-text-align-right">
                <strong><i>Total in Cart: ${this.state.totalPrice.toFixed(2)}</i></strong>
              </div>
            );

            content = (
              <div>
                <h2>Shopping Cart</h2>
                {checkoutButton}
                {totalPrice}
                <br />
                <div className="ui divided items">
                  {allCartEntriesPart}
                </div>
                <br />
                {totalPrice}
                {checkoutButton}
              </div>
            );
          } else {
            content = (
              <div>
                <br />
                <div className="haigy-width-100-percent haigy-text-align-center"><i><a href={navigator.briefinfoitemBrowseHash(constant.item.ROOT_PARENT_CATEGORY_ITEM_ID)}>No items in the shopping cart, click here to start shopping</a></i></div>
              </div>
            );
          }
        }
      } else {
        content = <UserSigninformComponent formHeader="Please sign in first" />;
      }

      return (
        <div>
          <BriefinfoitemCategorypathComponent categoryPath={[]} linkLastCategory={true} />

          <div className="haigy-width-100-percent haigy-text-align-center">
            <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-800px haigy-text-align-left">
              {content}
            </div>
          </div>
        </div>
      );
    },


    getCartData(props) {
      if (props.currentState.sessionIsUpToDate) {
        var requestedCartId = props.options.id;
        var cartIdInCache = cartHelper.getCartIdFromCache();
        if (cartIdInCache && requestedCartId === cartIdInCache) {   // cart data is fresh
          if (!this.state.fetchingCartData) {
            this.setState({
              loading: false,
              allItemIds: cartHelper.getAllItemIdInCartSorted().reverse(),
              totalPrice: cartHelper.getTotalValueInCart()
            });
          }
        } else if (requestedCartId) {   // need to fetch cart data
          var that = this;
          that.setState({fetchingCartData: true, loading: true});

          // if it was a guest cart and there were items in it, keep all of them in the new cart
          var guestCartItems = [];
          if (cartHelper.isGuestCart()) {   // it was a guest cart
            guestCartItems = cartHelper.getAllCartEntrySorted();
          }

          cachedRequest.fetchModel(cartModel, requestedCartId, {
            fetchParameters: {
              get_current_cart_if_checked_out: (that.props.getCurrentCartIfCheckedOut ? "yes" : "no")
            },

            success: function(fetchedCart) {
              if (fetchedCart.get("checked_out") === true) {
                navigator.orderShow(fetchedCart.get("order_id"), {replace: true});
              } else {
                var fetchedUser = fetchedCart.get("user");

                // this permission check should be performed on the server side
                // if the check failed on the server side, it will send back an error: constant.errorCode.AUTHENTICATION_FAILED
                // this authentication failed error should be handled by the error callback.
                // the permission check here shouldn't do anything unless user quickly signed in to another account before the response coming back from the server.
                if (fetchedUser && fetchedUser.is_temporary === true || cookie.user.getUserId() === fetchedUser.id.toString()) {
                  sessionHelper.setSession(fetchedUser, fetchedCart.id, fetchedCart.get("cart_entry"));
                  cartHelper.addItemsBackToCart(guestCartItems, function() {
                    that.setState({
                      fetchingCartData: false,
                      loading: false,
                      allItemIds: cartHelper.getAllItemIdInCartSorted().reverse(),
                      totalPrice: cartHelper.getTotalValueInCart()
                    });
                  });
                } else {
                  that.setState({hasPermission: false});
                }
              }
            },

            error: function(model, jqXHR) {
              if (jqXHR && jqXHR.responseJSON) {
                switch (jqXHR.responseJSON.error_code) {
                case constant.errorCode.RECORD_NOT_FOUND:
                  alerter(jqXHR.responseJSON.error_message);
                  that.setState({loading: false, allItemIds: []});
                  break;
                case constant.errorCode.AUTHENTICATION_FAILED:
                  that.setState({hasPermission: false});
                  break;
                default:
                  logger(jqXHR);
                  errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
                }
              } else {
                logger(constant.text.UNKNOWN_ERROR);
                errorHandler(null, constant.text.UNKNOWN_ERROR);
              }
            }
          }, true);
        } else {   // a guest cart
          this.setState({
            loading: false,
            allItemIds: cartHelper.getAllItemIdInCartSorted().reverse(),
            totalPrice: cartHelper.getTotalValueInCart()
          });
        }
      } else {
        this.setState({loading: true});
      }
    },


    componentDidMount() {
      this.getCartData(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getCartData(nextProps);
    },


    checkout() {
      if (cartHelper.hasDeliverableZipCode() || cartHelper.isGuestCart()) {
        navigator.orderCheckout();
      } else {
        alerter(constant.text.NO_SERVICE_WARNING);
      }
    },


    updateTotalPrice() {
      this.setState({totalPrice: cartHelper.getTotalValueInCart()});
    }
  });


  return CartShowMainComponent;
});
