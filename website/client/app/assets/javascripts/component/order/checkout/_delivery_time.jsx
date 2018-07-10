modulejs.define("component/order/checkout/_delivery_time", [
  "react",
  "material_ui",
  "app/utility",
  "app/navigator",
  "component/order/checkout/_setting_template"
], function(React, MaterialUi, utility, navigator, OrderCheckoutSettingtemplateComponent) {
  "use strict";


  const DEFAULT_DELIVERY_TIME_SLOT_START_TIME = 1080;
  const DELIVERY_TIME_SLOT_INTERVAL = 60;
  const MILLISECONDS_IN_A_HOUR = 86400000;

  var OrderCheckoutDeliverytimeComponent = React.createClass({
    propTypes: {
      deliveryTime: React.PropTypes.object,
      deliveryTimeSetCallback: React.PropTypes.func
    },


    getDefaultProps: function() {
      return {
        deliveryTimeSetCallback: function() {}
      };
    },


    getInitialState() {
      return {
        dialogOpen: false,
        deliveryDate: null,
        deliveryTimeSlotStartTime: null,
        deliveryTimeSlotEndTime: null
      };
    },


    render() {
      const RaisedButton = MaterialUi.RaisedButton;
      const DatePicker = MaterialUi.DatePicker;
      const MenuItem = MaterialUi.MenuItem;
      const SelectField = MaterialUi.SelectField;

      var minDate = this.getMinDeliveryDate();
      var maxDate = new Date(minDate.getTime() + 6 * MILLISECONDS_IN_A_HOUR);

      var selectedDate = utility.getOrderDeliveryDate(this.state.deliveryDate) || minDate;

      var dialogContent = (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-400px haigy-text-align-left">
            <br />
            <div><strong className="haigy-font-large">Choose A Delivery Time</strong></div>

            <DatePicker
              textFieldStyle={{width: "100%"}}
              floatingLabelText="Delivery Date"
              autoOk={false}
              formatDate={function(date) {return utility.getOrderDeliveryDateString(utility.getDateFormatYYYYMMDD(date));}}
              defaultDate={selectedDate}
              minDate={minDate}
              maxDate={maxDate}
              disableYearSelection={false}
              onChange={this.onDeliveryDateChange}
            />

            <SelectField
              floatingLabelText="Delivery Time Slot"
              value={this.state.deliveryTimeSlotStartTime}
              onChange={this.onDeliveryTimeSlotChange}
              fullWidth={true}
            >
              <MenuItem value={DEFAULT_DELIVERY_TIME_SLOT_START_TIME} primaryText="6 pm - 7 pm" />
              <MenuItem value={DEFAULT_DELIVERY_TIME_SLOT_START_TIME + DELIVERY_TIME_SLOT_INTERVAL} primaryText="7 pm - 8 pm" />
              <MenuItem value={DEFAULT_DELIVERY_TIME_SLOT_START_TIME + 2 * DELIVERY_TIME_SLOT_INTERVAL} primaryText="8 pm - 9 pm" />
            </SelectField>

            <br /><br />
            <div>If none of these delivery time works for you, you may place a customized order instead. <a href={navigator.mainHowhaigyworksHash}>Click to see how to place a customized order.</a></div>
            <br />
            <div>
              <RaisedButton className="haigy-width-100-percent" label="Save" primary={true} onTouchTap={this.setDeliveryTime} />
            </div>
            <br />
          </div>
        </div>
      );

      var deliveryTime = this.props.deliveryTime;
      var content = null;
      if (deliveryTime) {
        content = (
          <div>
            <div>{utility.getOrderDeliveryDateString(deliveryTime.date)}</div>
            <div>{utility.getOrderDeliveryTimeSlotTime(deliveryTime.timeSlotStartTime)} - {utility.getOrderDeliveryTimeSlotTime(deliveryTime.timeSlotEndTime)}</div>
          </div>
        );
      } else {
        content = <div className="haigy-font-color-required">Click to choose a delivery time</div>;
      }

      return (
        <OrderCheckoutSettingtemplateComponent
          header="Delivery Time"
          dialogOpen={this.state.dialogOpen}
          dialogContent={dialogContent}
          enableClick={true}
          onClick={this.onClick}
          onDialogClose={this.onDialogClose}
        >
          {content}
        </OrderCheckoutSettingtemplateComponent>
      );
    },


    componentWillMount() {
      this.getDeliveryTimeData(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getDeliveryTimeData(nextProps);
    },


    getDeliveryTimeData(props) {
      var deliveryTime = {};
      if (props && props.deliveryTime) {
        deliveryTime = props.deliveryTime;
      }
      this.setState({
        deliveryDate: deliveryTime.date,
        deliveryTimeSlotStartTime: deliveryTime.timeSlotStartTime || DEFAULT_DELIVERY_TIME_SLOT_START_TIME,
        deliveryTimeSlotEndTime: deliveryTime.timeSlotEndTime || DEFAULT_DELIVERY_TIME_SLOT_START_TIME + DELIVERY_TIME_SLOT_INTERVAL
      });
    },


    getMinDeliveryDate() {
      var minDeliveryDate = new Date();
      if (minDeliveryDate.getHours() > 11) {
        minDeliveryDate.setTime(minDeliveryDate.getTime() + MILLISECONDS_IN_A_HOUR);
      }
      return minDeliveryDate;
    },


    onClick(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.setState({dialogOpen: true});
    },


    onDialogClose() {
      this.setState({dialogOpen: false});
    },


    onDeliveryDateChange(dummyArgument, selectedDeliveryDate) {
      this.setState({deliveryDate: utility.getDateFormatYYYYMMDD(selectedDeliveryDate)});
    },


    onDeliveryTimeSlotChange(event, selectionIndex, selectionValue) {
      this.setState({deliveryTimeSlotStartTime: selectionValue, deliveryTimeSlotEndTime: selectionValue + DELIVERY_TIME_SLOT_INTERVAL});
    },


    setDeliveryTime() {
      var deliveryTime = {};
      deliveryTime.date = this.state.deliveryDate || utility.getDateFormatYYYYMMDD(this.getMinDeliveryDate());
      deliveryTime.timeSlotStartTime = this.state.deliveryTimeSlotStartTime;
      deliveryTime.timeSlotEndTime = this.state.deliveryTimeSlotEndTime;

      this.props.deliveryTimeSetCallback(deliveryTime);
      this.setState({dialogOpen: false});
    }
  });


  return OrderCheckoutDeliverytimeComponent;
});