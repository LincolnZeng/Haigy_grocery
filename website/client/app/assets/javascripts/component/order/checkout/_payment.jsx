modulejs.define("component/order/checkout/_payment", [
  "react",
  "stripe_checkout",
  "app/constant",
  "app/precompiled_asset",
  "app/error_handler",
  "component/main/_loading",
  "component/order/checkout/_setting_template"
], function(React, StripeCheckout, constant, precompiledAsset, errorHandler, MainLoadingComponent, OrderCheckoutSettingtemplateComponent) {
  "use strict";


  var stripeCheckoutHandler = null;


  var OrderCheckoutPaymentComponent = React.createClass({
    propTypes: {
      totalAmountToPay: React.PropTypes.number.isRequired,
      hasPaymentSet: React.PropTypes.bool,
      isStripePayment: React.PropTypes.bool,
      email: React.PropTypes.string,
      setStripePaymentCallback: React.PropTypes.func,
      setOfflinePaymentCallback: React.PropTypes.func,
      changePaymentCallback: React.PropTypes.func
    },


    getDefaultProps() {
      return {
        hasPaymentSet: false,
        isStripePayment: false,
        setStripePaymentCallback: function(stripeToken) {return stripeToken;},
        setOfflinePaymentCallback: function() {},
        changePaymentCallback: function() {}
      };
    },


    getInitialState() {
      return {
        loading: false
      };
    },


    render() {
      var content = null;
      if (this.state.loading) {
        content = content = <MainLoadingComponent />;
      } else {
        if (this.props.hasPaymentSet) {
          if (this.props.isStripePayment) {
            content = (
              <div>
                <div>Set to pay now <span className="haigy-font-italic">(Your money hasn't been charged yet. It will be charged after you click checkout button.)</span></div>
                <div className="haigy-text-align-right haigy-font-italic"><a href="#" onClick={this.changePaymentType}>Change</a></div>
              </div>
            );
          } else {
            content = (
              <div>
                <div>Set to pay when you receive groceries</div>
                <div className="haigy-text-align-right haigy-font-italic"><a href="#" onClick={this.changePaymentType}>Change</a></div>
              </div>
            );
          }
        } else {
          content = (
            <div className="haigy-font-italic">
              <div>
                <a href="#" onClick={this.byOnlinePayment}>Pay now (credit / debit card)</a>
              </div>
              <br />
              <div>
                <a href="#" onClick={this.byOfflinePayment}>Pay when you receive groceries (credit / debit card or cash)</a>
              </div>
            </div>
          );
        }
      }

      return (
        <OrderCheckoutSettingtemplateComponent header="Payment Method" enableClick={false}>
          {content}
        </OrderCheckoutSettingtemplateComponent>
      );
    },


    componentWillUnmount() {
      if (stripeCheckoutHandler) {
        stripeCheckoutHandler.close();
      }
    },


    byOnlinePayment(event) {
      event.preventDefault();

      var that = this;

      that.setState({loading: true});

      if (!stripeCheckoutHandler) {
        stripeCheckoutHandler = StripeCheckout.configure({
          key: constant.Stripe.PUBLISHABLE_KEY,
          name: "Haigy Grocery Delivery",
          image: precompiledAsset.image.HAIGY_BEAR,
          locale: "en",
          currency: "USD",
          zipCode: true
        });
      }

      var totalAmountToPay = that.props.totalAmountToPay;
      if (!totalAmountToPay || totalAmountToPay <= 0.0) {
        totalAmountToPay = 0;
        errorHandler(null, "Incorrect total amount to pay. It is less than or equal to 0. ", true);
      } else {
        totalAmountToPay = totalAmountToPay.toFixed(2) * 100;
      }

      stripeCheckoutHandler.open({
        email: that.props.email,
        amount: totalAmountToPay,
        token(token) {
          that.props.setStripePaymentCallback(token);
        },
        opened() {
          that.setState({loading: false});
        }
      });
    },


    byOfflinePayment(event) {
      event.preventDefault();
      this.props.setOfflinePaymentCallback();
    },


    changePaymentType(event) {
      event.preventDefault();
      this.props.changePaymentCallback();
    }
  });


  return OrderCheckoutPaymentComponent;
});