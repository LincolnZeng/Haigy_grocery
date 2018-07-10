modulejs.define("component/order/show", [
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/constant",
  "app/utility",
  "app/cache",
  "app/navigator",
  "app/cached_request",
  "app/error_handler",
  "helper/cart",
  "model/order",
  "collection/cart_entry/synchronize_all",
  "component/main/_loading",
  "component/user/_sign_in_form",
  "component/order/checkout/_summary_table",
  "component/cart/show/_cart_entry"
], function(logger, React, MaterialUi, validator, constant, utility, cache, navigator, cachedRequest,
  errorHandler, cartHelper, orderModel, cartentrySynchronizeallCollection, MainLoadingComponent,
  UserSigninformComponent, OrderCheckoutSummarytableComponent, CartShowCartentryComponent
) {
  "use strict";


  var OrderShowComponent = React.createClass({
    propTypes: {
      options: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired
      }).isRequired
    },


    getInitialState() {
      return {
        loading: true,
        fetchedOrder: (new orderModel),
        allCartEntries: [],
        signInRequired: false
      };
    },


    render() {
      const RaisedButton = MaterialUi.RaisedButton;
      var content = null;

      if (this.state.loading) {
        content = <MainLoadingComponent />;
      } else if (this.state.signInRequired) {
        content = <UserSigninformComponent formHeader="Please sign in first" />;
      } else {
        var fetchedOrder = this.state.fetchedOrder;
        var totalValueInCart = cartHelper.getTotalValueInCart(this.state.allCartEntries);

        var deliveryAddress = fetchedOrder.get("address");
        var businessName = null;
        var note = null;
        if (deliveryAddress.is_business_address && deliveryAddress.business_name && deliveryAddress.business_name.length > 0) {
          businessName = <div>{deliveryAddress.business_name}</div>;
        }
        if (deliveryAddress.note && deliveryAddress.note.length > 0) {
          note = <div>{deliveryAddress.note}</div>;
        }

        var reorderButton = (
          <div className="haigy-text-align-right haigy-padding-t-10px haigy-padding-b-10px">
            <RaisedButton label="Add all items to cart" secondary={true} onTouchTap={this.reorder} />
          </div>
        );

        var allCartEntriesPart = this.state.allCartEntries.map(function(cartEntry) {
          return <CartShowCartentryComponent key={cartEntry.itemId} cartEntry={cartEntry} hasCartOperationButtons={false} />;
        });

        content = (
          <div>
            <h3>Order {fetchedOrder.id} has been {utility.getOrderStatus(fetchedOrder.get("status"))}!</h3>

            <OrderCheckoutSummarytableComponent totalValueInCart={totalValueInCart} deliveryFee={fetchedOrder.get("delivery_fee")} />

            <div className="ui fluid card">
              <div className="content">
                <h4 className="ui header">Delivery Address</h4>
                <div className="description haigy-padding-l-30px haigy-padding-r-30px">
                  <div>
                    {businessName}
                    <div>{deliveryAddress.street_address}</div>
                    <div>{deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zip_code}</div>
                    {note}
                  </div>
                </div>
                <br />
                <h4 className="ui header">Delivery Time</h4>
                <div className="description haigy-padding-l-30px haigy-padding-r-30px">
                  <div>
                    <div>{utility.getOrderDeliveryDateString(fetchedOrder.get("delivery_date"))}</div>
                    <div>
                      {utility.getOrderDeliveryTimeSlotTime(fetchedOrder.get("delivery_time_slot_start_time"))}
                      <span> - </span>
                      {utility.getOrderDeliveryTimeSlotTime(fetchedOrder.get("delivery_time_slot_end_time"))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h3>Items</h3>
            {reorderButton}
            <br />
            <div className="ui divided items">
              {allCartEntriesPart}
            </div>
            <br />
            {reorderButton}
          </div>
        );
      }

      return content;
    },


    componentWillMount() {
      this.getOrderData(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getOrderData(nextProps);
    },


    getOrderData(props) {
      var that = this;
      var orderId = props.options.id;

      that.setState({loading: true});
      cachedRequest.fetchModel(orderModel, orderId, {
        success: function(fetchedOrder) {
          var cartEntryCollection = new cartentrySynchronizeallCollection(fetchedOrder.get("cart_entry"));
          var allCartEntries = cartHelper.parseServerResponse(cartEntryCollection, false);
          that.setState({
            loading: false,
            fetchedOrder: fetchedOrder,
            allCartEntries: allCartEntries,
            signInRequired: false
          });
        },

        error: function(model, jqXHR) {
          if (jqXHR && jqXHR.responseJSON) {
            switch (jqXHR.responseJSON.error_code) {
            case constant.errorCode.SIGN_IN_REQUIRED:
              that.setState({loading: false, signInRequired: true});
              break;
            default:
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
              that.setState({loading: false});
            }
          } else {
            logger(jqXHR);
          }
        }
      }, true);
    },


    reorder() {
      cartHelper.addItemsBackToCart(this.state.allCartEntries.slice().reverse(), function() {
        navigator.cartManage();
      });
    }
  });


  return OrderShowComponent;
});