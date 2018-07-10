modulejs.define("component/order/checkout/main", [
  "logger",
  "alerter",
  "confirmer",
  "react",
  "material_ui",
  "app/constant",
  "app/navigator",
  "app/cookie",
  "app/cache",
  "app/cached_request",
  "app/error_handler",
  "helper/cart",
  "helper/session",
  "model/order",
  "component/order/checkout/_summary_table",
  "component/order/checkout/_payment",
  "component/order/checkout/_delivery_address",
  "component/order/checkout/_delivery_time",
  "component/order/checkout/_email",
  "component/order/checkout/_phone",
  "component/main/_loading",
  "component/user/_sign_up_form"
], function(logger, alerter, confirmer, React, MaterialUi, constant, navigator,
  cookie, cache, cachedRequest, errorHandler, cartHelper, sessionHelper, orderModel,
  OrderCheckoutSummarytableComponent, OrderCheckoutPaymentComponent,
  OrderCheckoutDeliveryaddressComponent, OrderCheckoutDeliverytimeComponent,
  OrderCheckoutEmailComponent, OrderCheckoutPhoneComponent,
  MainLoadingComponent, UserSignupformComponent
) {
  "use strict";


  var OrderCheckoutMainComponent = React.createClass({
    propTypes: {
      currentState: React.PropTypes.shape({
        sessionIsUpToDate: React.PropTypes.bool.isRequired,
        userAttributes: React.PropTypes.shape({
          userId: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
          ]),
          isTemporary: React.PropTypes.bool,
          email: React.PropTypes.string,
          phone: React.PropTypes.string,
          address: React.PropTypes.object
        }).isRequired
      }).isRequired
    },


    getInitialState() {
      return {
        loading: false,
        totalValueInCart: 0.0,
        deliveryFee: constant.business.BASIC_DELIVERY_FEE,
        hasPaymentSet: false,
        isStripePayment: false,
        email: null,
        phone: null,
        deliveryTime: null,
        signUpDialogOpen: false
      };
    },


    render() {
      var content = null;

      if (this.state.loading) {
        content = <MainLoadingComponent />;
      } else {
        const RaisedButton = MaterialUi.RaisedButton;
        const Dialog = MaterialUi.Dialog;

        var userAttributes = this.props.currentState.userAttributes;
        var email = this.state.email;

        var smallScreenSignUpButton = null;
        var wideScreenSignUpButton = null;
        if (userAttributes.isTemporary || cartHelper.isGuestCart()) {
          var signUpButtonText = null;
          var deliveryAddress = this.props.currentState.userAttributes.address;
          if (deliveryAddress && deliveryAddress.zipCode && email) {
            signUpButtonText = "Sign Up! Only Password Needed";
          } else {
            signUpButtonText = "Sign Up";
          }
          smallScreenSignUpButton = (
            <div>
              <RaisedButton className="haigy-width-100-percent" label={signUpButtonText} secondary={true} onTouchTap={this.onSignUp} />
            </div>
          );
          wideScreenSignUpButton = (
            <span>
              <RaisedButton label={signUpButtonText} secondary={true} onTouchTap={this.onSignUp} />
            </span>
          );
        }

        var userId = null;
        if (userAttributes.isTemporary === false) {
          userId = userAttributes.userId;
        }

        var totalValueInCart = this.state.totalValueInCart;
        var deliveryFee = this.state.deliveryFee;

        content = (
          <div>
            <OrderCheckoutSummarytableComponent totalValueInCart={totalValueInCart} deliveryFee={deliveryFee} deliveryFeeAdjustable={true} adjustDeliveryFeeCallback={this.onDeliveryFeeAdjusted} />

            <OrderCheckoutPaymentComponent
              totalAmountToPay={totalValueInCart + deliveryFee}
              hasPaymentSet={this.state.hasPaymentSet} isStripePayment={this.state.isStripePayment} email={email}
              setStripePaymentCallback={this.onStripePaymentSet}
              setOfflinePaymentCallback={this.onOfflinePaymentSet}
              changePaymentCallback={this.resetPaymentType}
            />

            <OrderCheckoutDeliveryaddressComponent currentState={this.props.currentState} />
            <OrderCheckoutDeliverytimeComponent deliveryTime={this.state.deliveryTime} deliveryTimeSetCallback={this.onDeliveryTimeSet} />
            <OrderCheckoutEmailComponent userId={userId} email={email} emailSetCallback={this.onEmailSet} />
            <OrderCheckoutPhoneComponent userId={userId} phone={this.state.phone} phoneSetCallback={this.onPhoneSet} />

            <br />

            <div>
              <div className="haigy-text-align-right haigy-display-only-wide-screen">
                {wideScreenSignUpButton}
                <span className="haigy-padding-l-20px">
                  <RaisedButton label="Place Order" primary={true} onTouchTap={this.onPlaceOrder} />
                </span>
              </div>

              <div className="haigy-display-only-small-screen">
                <div className="haigy-padding-t-10px haigy-padding-b-10px">
                  <RaisedButton className="haigy-width-100-percent" label="Place Order" primary={true} onTouchTap={this.onPlaceOrder} />
                </div>
                {smallScreenSignUpButton}
              </div>
            </div>

            <Dialog
              open={this.state.signUpDialogOpen}
              onRequestClose={this.closeSignUpDialog}
              autoDetectWindowHeight={false}
              style={constant.materialUi.DIALOG_STYLE}
            >
              <UserSignupformComponent
                formHeader="Sign Up"
                hasPhoneInput={true}
                userId={userAttributes.userId}
                email={this.state.email}
                phone={this.state.phone}
                address={userAttributes.address}
              />
            </Dialog>
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
      this.getCheckoutData(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getCheckoutData(nextProps);
    },


    getCheckoutData(props) {
      if (props.currentState.sessionIsUpToDate) {
        var isGuestCart = cartHelper.isGuestCart();
        if (cartHelper.getCartIdFromCache() || isGuestCart) {
          var userAttributes = props.currentState.userAttributes;
          var cachedCheckoutData = cache.orderCheckoutData.get() || {};
          if (userAttributes.email) {
            cachedCheckoutData.email = userAttributes.email;
          }
          if (userAttributes.phone) {
            cachedCheckoutData.phone = userAttributes.phone;
          }
          if (!cachedCheckoutData.deliveryFee) {
            cachedCheckoutData.deliveryFee = constant.business.BASIC_DELIVERY_FEE;
          }
          cache.orderCheckoutData.set(cachedCheckoutData);
          this.setState({
            totalValueInCart: cartHelper.getTotalValueInCart(),
            deliveryFee: cachedCheckoutData.deliveryFee,
            hasPaymentSet: cachedCheckoutData.hasPaymentSet || false,
            isStripePayment: cachedCheckoutData.isStripePayment || false,
            email: cachedCheckoutData.email,
            phone: cachedCheckoutData.phone,
            deliveryTime: cachedCheckoutData.deliveryTime
          });
        } else {
          this.dataStaleAndCheckCartAgain();
        }

        if (!cartHelper.hasDeliverableZipCode() && userAttributes.address) {
          alerter(constant.text.NO_SERVICE_WARNING);
        }
      } else {
        this.setState({loading: true});
      }
    },


    dataStaleAndCheckCartAgain() {
      var alertMessage = "Cannot checkout because the information of items in the cart was out of date. It has been updated. Please take a look and checkout agian. Thank you!";
      this.setState({loading: true});
      // remove all request cache
      cache.clearCachedRequestCache();
      cartHelper.clearCachedCartIdToForceCartRefresh();
      if (cartHelper.isGuestCart()) {
        // force all cart entries to be re-added to the cart to update the price info.
        var allCartEntries = cartHelper.getAllCartEntrySorted();
        cartHelper.clearCart();
        cartHelper.addItemsBackToCart(allCartEntries, function() {
          navigator.cartManage({replace: true});
          alerter(alertMessage);
        });
      } else {
        navigator.cartManage({replace: true});
        alerter(alertMessage);
      }
    },


    onDeliveryFeeAdjusted(newDeliveryFee) {
      var cachedCheckoutData = cache.orderCheckoutData.get() || {};
      cachedCheckoutData.deliveryFee = newDeliveryFee;
      cache.orderCheckoutData.set(cachedCheckoutData);
      this.setState({deliveryFee: newDeliveryFee});
    },


    onStripePaymentSet(stripeToken) {
      var email = stripeToken.email;
      var cachedCheckoutData = cache.orderCheckoutData.get() || {};
      cachedCheckoutData.hasPaymentSet = true;
      cachedCheckoutData.isStripePayment = true;
      cachedCheckoutData.stripeTokenId = stripeToken.id;
      if (cachedCheckoutData.email) {
        email = cachedCheckoutData.email;
      } else {
        cachedCheckoutData.email = email;
      }
      cache.orderCheckoutData.set(cachedCheckoutData);
      this.setState({email: email, hasPaymentSet: true, isStripePayment: true});
    },


    onOfflinePaymentSet() {
      var cachedCheckoutData = cache.orderCheckoutData.get() || {};
      cachedCheckoutData.hasPaymentSet = true;
      cachedCheckoutData.isStripePayment = false;
      cachedCheckoutData.stripeTokenId = null;
      cache.orderCheckoutData.set(cachedCheckoutData);
      this.setState({hasPaymentSet: true, isStripePayment: false});
    },


    resetPaymentType() {
      var cachedCheckoutData = cache.orderCheckoutData.get() || {};
      cachedCheckoutData.hasPaymentSet = false;
      cachedCheckoutData.isStripePayment = false;
      cachedCheckoutData.stripeTokenId = null;
      cache.orderCheckoutData.set(cachedCheckoutData);
      this.setState({hasPaymentSet: false, isStripePayment: false});
    },


    onDeliveryTimeSet(deliveryTime) {
      var cachedCheckoutData = cache.orderCheckoutData.get() || {};
      cachedCheckoutData.deliveryTime = deliveryTime;
      cache.orderCheckoutData.set(cachedCheckoutData);
      this.setState({deliveryTime: deliveryTime});
    },


    onEmailSet(email) {
      var cachedCheckoutData = cache.orderCheckoutData.get() || {};
      cachedCheckoutData.email = email;
      cache.orderCheckoutData.set(cachedCheckoutData);
      this.setState({email: email});
    },


    onPhoneSet(phone) {
      var cachedCheckoutData = cache.orderCheckoutData.get() || {};
      cachedCheckoutData.phone = phone;
      cache.orderCheckoutData.set(cachedCheckoutData);
      this.setState({phone: phone});
    },


    onSignUp() {
      this.setState({signUpDialogOpen: true});
    },


    closeSignUpDialog() {
      this.setState({signUpDialogOpen: false});
    },


    onPlaceOrder(event, showSignUpReminder) {
      var userAttributes = this.props.currentState.userAttributes;
      var deliveryAddress = userAttributes.address;

      if (cartHelper.hasDeliverableZipCode() || !deliveryAddress) {
        var isGuestOrder = cartHelper.isGuestCart();
        var unsetFields = [];
        var index = 0;

        if (this.state.hasPaymentSet !== true) {
          unsetFields.push(<span key={index} className="haigy-font-color-required">Payment</span>);
          ++index;
          unsetFields.push(<span key={index}>, </span>);
          ++index;
        }

        if (!deliveryAddress || !deliveryAddress.zipCode) {
          unsetFields.push(<span key={index} className="haigy-font-color-required">Delivery Address</span>);
          ++index;
          unsetFields.push(<span key={index}>, </span>);
          ++index;
        }

        if (!this.state.deliveryTime) {
          unsetFields.push(<span key={index} className="haigy-font-color-required">Delivery Time</span>);
          ++index;
          unsetFields.push(<span key={index}>, </span>);
          ++index;
        }

        if (isGuestOrder) {
          if (!this.state.email) {
            unsetFields.push(<span key={index} className="haigy-font-color-required">Email</span>);
            ++index;
            unsetFields.push(<span key={index}>, </span>);
            ++index;
          }
          if (!this.state.phone) {
            unsetFields.push(<span key={index} className="haigy-font-color-required">Phone Number</span>);
            ++index;
            unsetFields.push(<span key={index}>, </span>);
            ++index;
          }
        }

        var that = this;
        if (unsetFields.length > 0) {
          unsetFields.pop();
          var lastUnsetField = unsetFields.pop();
          var itOrThem = null;
          var hasOrHaveNot = null;
          if (unsetFields.length > 0) {
            unsetFields.pop();
            unsetFields.push(<span key={index}> and </span>);
            unsetFields.push(lastUnsetField);
            hasOrHaveNot = "haven't";
            itOrThem = "them";
          } else {
            unsetFields.push(lastUnsetField);
            hasOrHaveNot = "hasn't";
            itOrThem = "it";
          }
          alerter(<div>{unsetFields} {hasOrHaveNot} been set. Could you please set {itOrThem} and place the order again? Thanks!</div>);
        } else if ((userAttributes.isTemporary === true || isGuestOrder) && showSignUpReminder !== false) {
          var showUpReminder = (
            <div>
              <div>If you create a Haigy account, it will remember your address, email, phone number, and order history to make your future shoppings easier.</div>
              <br />
              <div>Otherwise, for your privacy, Haigy won't save any of your information, and your order can only be reviewed for the next seven days.</div>
            </div>
          );
          confirmer(showUpReminder, function() {
            that.onPlaceOrder(null, false);
          }, function() {
            that.onSignUp();
          }, "Next Time", "Sign Up", "Would you like to create a Haigy account?").open();
        } else {
          var cartId = cartHelper.getCartIdFromCache();
          if (cartId || isGuestOrder) {
            var orderAttributes = {};

            var cachedCheckoutData = cache.orderCheckoutData.get() || {};
            orderAttributes.delivery_fee = cachedCheckoutData.deliveryFee;

            if (cachedCheckoutData.hasPaymentSet && cachedCheckoutData.isStripePayment && cachedCheckoutData.stripeTokenId) {
              orderAttributes.is_stripe_payment = true;
              orderAttributes.stripe_token_id = cachedCheckoutData.stripeTokenId;
            } else {
              orderAttributes.is_stripe_payment = false;
            }

            orderAttributes.user_id = userAttributes.userId;
            orderAttributes.cart_id = cartId;
            orderAttributes.cart = cartHelper.getServerRequiredCartInfo();
            orderAttributes.is_business_address = deliveryAddress.isBusinessAddress;
            orderAttributes.business_name = deliveryAddress.businessName;
            orderAttributes.street_address = deliveryAddress.streetAddress;
            orderAttributes.city = deliveryAddress.city;
            orderAttributes.state = deliveryAddress.state;
            orderAttributes.zip_code = deliveryAddress.zipCode;
            orderAttributes.address_note = deliveryAddress.note;

            var deliveryTime = that.state.deliveryTime;
            orderAttributes.delivery_date = deliveryTime.date;
            orderAttributes.delivery_time_slot_start_time = deliveryTime.timeSlotStartTime;
            orderAttributes.delivery_time_slot_end_time = deliveryTime.timeSlotEndTime;

            orderAttributes.email = that.state.email || "";
            orderAttributes.phone = that.state.phone || "";

            that.setState({loading: true});
            cachedRequest.saveModel(orderModel, orderAttributes, {
              success: function(placedOrder) {
                cache.orderCheckoutData.clear();
                cartHelper.clearCachedCartIdToForceCartRefresh();
                if (isGuestOrder) {
                  // a guest order. cannot use "cartHelper.isGuestCart()" here, because a temporary user token will be generated in the response.
                  // after a guest checked out once, he/she becomes a temporary user
                  cookie.user.setUserId(placedOrder.get("user_id"));
                  sessionHelper.synchronizeSession();
                }
                navigator.orderPlacedreminder(placedOrder.id);
              },

              error: function(model, jqXHR) {
                if (jqXHR && jqXHR.responseJSON) {
                  var errorCode = jqXHR.responseJSON.error_code;

                  switch(errorCode) {
                  case constant.errorCode.ITEM_INFO_OUTDATED:
                    that.dataStaleAndCheckCartAgain();
                    break;
                  default:
                    logger(jqXHR);
                    errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
                  }
                } else {
                  logger(jqXHR);
                }
                that.setState({loading: false});
              }
            });
          } else {
            that.dataStaleAndCheckCartAgain();
          }
        }
      } else {
        alerter(constant.text.NO_SERVICE_WARNING);
      }
    }
  });


  return OrderCheckoutMainComponent;
});