modulejs.define("component/order/checkout/_email", [
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/constant",
  "app/cached_request",
  "app/error_handler",
  "model/user",
  "component/order/checkout/_setting_template",
  "component/user/account_management/_email_change_dialog"
], function(logger, React, MaterialUi, validator, constant, cachedRequest,
  errorHandler, userModel, OrderCheckoutSettingtemplateComponent,
  UserAccountmanagementEmailchangedialogComponent
) {
  "use strict";


  const OrderCheckoutEmailComponent = React.createClass({
    propTypes: {
      email: React.PropTypes.string,
      userId: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
      ]),
      emailSetCallback: React.PropTypes.func
    },


    getDefaultProps: function() {
      return {
        userId: null,
        emailSetCallback: function() {}
      };
    },


    getInitialState() {
      return {
        dialogOpen: false
      };
    },


    render() {
      var email = this.props.email;

      var content = null;
      if (email) {
        content = <div>{email}</div>;
      } else if (this.props.userId) {
        content = (
          <div>
            <div className="haigy-font-color-optional haigy-padding-b-10px">(Optional) click to set your email</div>
            <div>We will send emails to let you know the order status</div>
          </div>
        );
      } else {
        content = (
          <div>
            <div className="haigy-font-color-required haigy-padding-b-10px">Click to set your email</div>
            <div>We will send emails to let you know the order status</div>
          </div>
        );
      }

      return (
        <OrderCheckoutSettingtemplateComponent
          header="Email"
          enableClick={true}
          onClick={this.onClick}
        >
          {content}
          <UserAccountmanagementEmailchangedialogComponent
            open={this.state.dialogOpen}
            onRequestClose={this.onDialogClose}
            email={email}
            userId={this.props.userId}
            emailSetCallback={this.props.emailSetCallback}
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


  return OrderCheckoutEmailComponent;
});