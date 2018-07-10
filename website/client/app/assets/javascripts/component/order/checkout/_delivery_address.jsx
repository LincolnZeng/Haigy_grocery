modulejs.define("component/order/checkout/_delivery_address", [
  "react",
  "component/order/checkout/_setting_template",
  "component/user/_address_dialog/main"
], function(React, OrderCheckoutSettingtemplateComponent, UserAddressdialogMainComponent) {
  "use strict";


  var OrderCheckoutDeliveryaddressComponent = React.createClass({
    propTypes: {
      currentState: React.PropTypes.shape({
        userAttributes: React.PropTypes.shape({
          address: React.PropTypes.object
        }).isRequired,
        sessionIsUpToDate: React.PropTypes.bool.isRequired
      }).isRequired
    },


    getInitialState() {
      return {
        showAddressdialog: false
      };
    },


    render() {
      var deliveryAddress = this.props.currentState.userAttributes.address;
      var content = null;
      if (deliveryAddress && deliveryAddress.zipCode) {
        var businessName = null;
        var note = null;
        if (deliveryAddress.isBusinessAddress && deliveryAddress.businessName && deliveryAddress.businessName.length > 0) {
          businessName = <div>{deliveryAddress.businessName}</div>;
        }
        if (deliveryAddress.note && deliveryAddress.note.length > 0) {
          note = <div>{deliveryAddress.note}</div>;
        }
        content = (
          <div>
            {businessName}
            <div>{deliveryAddress.streetAddress}</div>
            <div>{deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}</div>
            {note}
          </div>
        );
      } else {
        content = <div className="haigy-font-color-required">Click to set your delivery address</div>;
      }

      return (
        <OrderCheckoutSettingtemplateComponent header="Delivery Address" dialogOpen={false} enableClick={true} onClick={this.onClick}>
          {content}
          <UserAddressdialogMainComponent
            currentState={this.props.currentState}
            open={this.state.showAddressdialog}
            onRequestClose={this.closeAddressdialog}
          />
        </OrderCheckoutSettingtemplateComponent>
      );
    },


    onClick(event) {
      event.preventDefault();
      this.setState({showAddressdialog: true});
    },


    closeAddressdialog() {
      this.setState({showAddressdialog: false});
    }
  });


  return OrderCheckoutDeliveryaddressComponent;
});