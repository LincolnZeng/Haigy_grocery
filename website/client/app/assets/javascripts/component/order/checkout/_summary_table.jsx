modulejs.define("component/order/checkout/_summary_table", [
  "react",
  "app/constant"
], function(React, constant) {
  "use strict";


  var OrderCheckoutSummarytableComponent = React.createClass({
    propTypes: {
      totalValueInCart: React.PropTypes.number.isRequired,
      deliveryFee: React.PropTypes.number.isRequired,
      deliveryFeeAdjustable: React.PropTypes.bool,
      adjustDeliveryFeeCallback: React.PropTypes.func
    },


    getDefaultProps: function() {
      return {
        deliveryFeeAdjustable: false,
        adjustDeliveryFeeCallback: function() {}
      };
    },


    render() {
      var deliveryFee = this.props.deliveryFee;
      var deliveryFeeRow = null;

      if (!this.props.deliveryFeeAdjustable || (deliveryFee && deliveryFee > 0.0)) {
        var removeDeliveryFeeLink = null;
        if (this.props.deliveryFeeAdjustable) {
          removeDeliveryFeeLink = <span> (<a href="#" onClick={this.removeDeliveryFee}>Click to Remove</a>)</span>;
        }
        deliveryFeeRow = (
          <tr>
            <td>Delivery Fee:</td>
            <td className="right aligned">
              ${deliveryFee.toFixed(2)}{removeDeliveryFeeLink}
            </td>
          </tr>
        );
      } else {
        deliveryFeeRow = (
          <tr>
            <td>Delivery Fee:</td>
            <td className="right aligned">
              <div>${deliveryFee.toFixed(2)}</div>
              <div className="haigy-text-align-left haigy-padding-l-20px haigy-padding-t-10px haigy-padding-b-10px">No delivery fee for users who shop at Haigy first 3 times, and for users who have placed other orders with the same delivery time to the same delivery address. We will automatically adjust the delivery fee for you before the final charge. So please don't worry if you forgot to remove it or removed it by mistake.</div>
              <div><a href="#" onClick={this.addBackDeliveryFee}>Add Delivery Fee Back</a></div>
            </td>
          </tr>
        );
      }

      return (
        <table className="ui unstackable pink table">
          <tbody>
            <tr>
              <td>Items in cart:</td>
              <td className="right aligned">${this.props.totalValueInCart.toFixed(2)}</td>
            </tr>
            {deliveryFeeRow}
          </tbody>
          <tfoot>
            <tr>
              <th><strong>Order total:</strong></th>
              <th className="right aligned"><strong>
                ${(this.props.totalValueInCart + deliveryFee).toFixed(2)}
              </strong></th>
            </tr>
          </tfoot>
        </table>
      );
    },


    removeDeliveryFee(event) {
      event.preventDefault();
      event.currentTarget.blur();

      var newDeliveryFee = 0.0;
      this.props.adjustDeliveryFeeCallback(newDeliveryFee);
    },


    addBackDeliveryFee(event) {
      event.preventDefault();
      event.currentTarget.blur();

      var newDeliveryFee = constant.business.BASIC_DELIVERY_FEE;
      this.props.adjustDeliveryFeeCallback(newDeliveryFee);
    }
  });


  return OrderCheckoutSummarytableComponent;
});