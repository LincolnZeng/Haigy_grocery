modulejs.define("component/order/placed_reminder", [
  "react",
  "app/navigator"
], function(React, navigator) {
  "use strict";


  var OrderPlacedreminderComponent = React.createClass({
    propTypes: {
      options: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired
      }).isRequired
    },


    render() {
      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-800px haigy-text-align-left">
            <h3 className="ui dividing header">Your order has been successfully placed!</h3><br />
            <div>Thank you very much for shopping with Haigy! A confirm email will send to you shortly.</div><br />
            <div>You could click <a href={navigator.orderShowHash(this.props.options.id)}>here</a> to see your order details.</div><br />
          </div>
        </div>
      );
    }
  });


  return OrderPlacedreminderComponent;
});