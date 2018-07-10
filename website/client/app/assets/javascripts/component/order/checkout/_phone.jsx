modulejs.define("component/order/checkout/_phone", [
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/constant",
  "app/utility",
  "app/cached_request",
  "app/error_handler",
  "model/user",
  "component/order/checkout/_setting_template",
  "component/user/account_management/_phone_change_dialog"
], function(logger, React, MaterialUi, validator, constant, utility, cachedRequest,
  errorHandler, userModel, OrderCheckoutSettingtemplateComponent,
  UserAccountmanagementPhonechangedialogComponent
) {
  "use strict";


  const OrderCheckoutPhoneComponent = React.createClass({
    propTypes: {
      phone: React.PropTypes.string,
      userId: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
      ]),
      phoneSetCallback: React.PropTypes.func
    },


    getDefaultProps: function() {
      return {
        userId: null,
        phoneSetCallback: function() {}
      };
    },


    getInitialState() {
      return {
        dialogOpen: false
      };
    },


    render() {
      var phone = this.props.phone;

      var content = null;
      if (phone) {
        content = <div>{phone}</div>;
      } else if (this.props.userId) {
        content = (
          <div>
            <div className="haigy-font-color-optional haigy-padding-b-10px">(Optional) click to set your phone number</div>
            <div>We may need your phone number to contact you in case there are issues with your delivery</div>
          </div>
        );
      } else {
        content = (
          <div>
            <div className="haigy-font-color-required haigy-padding-b-10px">Click to set your phone number</div>
            <div>We need your phone number to contact you in case there are issues with your delivery</div>
          </div>
        );
      }

      return (
        <OrderCheckoutSettingtemplateComponent
          header="Phone Number"
          enableClick={true}
          onClick={this.onClick}
        >
          {content}
          <UserAccountmanagementPhonechangedialogComponent
            open={this.state.dialogOpen}
            onRequestClose={this.onDialogClose}
            phone={phone}
            userId={this.props.userId}
            phoneSetCallback={this.props.phoneSetCallback}
          />
        </OrderCheckoutSettingtemplateComponent>
      );
    },


    onClick(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.setState({dialogOpen: true});
    },


    onDialogClose() {
      this.setState({dialogOpen: false});
    }
  });


  return OrderCheckoutPhoneComponent;
});