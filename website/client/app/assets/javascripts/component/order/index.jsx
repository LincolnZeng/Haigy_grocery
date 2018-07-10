modulejs.define("component/order/index", [
  "logger",
  "react",
  "app/utility",
  "app/navigator",
  "app/cached_request",
  "app/error_handler",
  "collection/order/index",
  "component/main/_loading"
], function(logger, React, utility, navigator, cachedRequest, errorHandler,
  orderIndexCollection, MainLoadingComponent
) {
  "use strict";


  var OrderIndexComponent = React.createClass({
    propTypes: {
      currentState: React.PropTypes.shape({
        sessionIsUpToDate: React.PropTypes.bool.isRequired,
        userAttributes: React.PropTypes.shape({
          userId: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
          ])
        }).isRequired
      }).isRequired
    },


    getInitialState() {
      return {
        loading: false,
        allOrders: []
      };
    },


    render() {
      var content = null;
      if (this.state.loading) {
        content = <MainLoadingComponent />;
      } else {
        var orderHistoryTable = null;
        if (this.state.allOrders.length > 0) {
          var allTableRows = this.state.allOrders.map(function(order) {
            var orderPlacedTime = new Date(parseInt(order.get("created_at")) * 1000);
            return (
              <tr key={order.id}>
                <td>{orderPlacedTime.toLocaleDateString()}</td>
                <td>
                  <span>{utility.getOrderDeliveryDateString(order.get("delivery_date"))} </span>
                  <span>{utility.getOrderDeliveryTimeSlotTime(order.get("delivery_time_slot_start_time"))} - </span>
                  <span>{utility.getOrderDeliveryTimeSlotTime(order.get("delivery_time_slot_end_time"))}</span>
                </td>
                <td><a href={navigator.orderShowHash(order.id)}>{order.id}</a></td>
                <td><a href={navigator.orderShowHash(order.id)}>{utility.getOrderStatus(order.get("status"))}</a></td>
              </tr>
            );
          });

          orderHistoryTable = (
            <div>
              <table className="ui single line table">
                <thead>
                  <tr>
                    <th>Order Placed Date</th>
                    <th>Order Delivery Time</th>
                    <th>Order ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTableRows}
                </tbody>
              </table>
            </div>
          );
        } else {
          orderHistoryTable = <div>You haven't placed any order yet.</div>;
        }

        content = (
          <div>
            <h2 className="ui header">My Order History</h2>
            <br />
            {orderHistoryTable}
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
      this.getAllOrderData(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getAllOrderData(nextProps);
    },


    getAllOrderData(props) {
      var that = this;
      var userId = props.currentState.userAttributes.userId;

      that.setState({loading: true});
      cachedRequest.fetchCollection(orderIndexCollection, {userId: userId}, {
        success: function(fetchedOrderCollection) {
          that.setState({loading: false, allOrders: fetchedOrderCollection.models});
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
          that.setState({loading: false});
        }
      });
    }
  });


  return OrderIndexComponent;
});