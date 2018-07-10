modulejs.define("haigy/lib/1.1.0/alerter", [
  "react",
  "reactdom",
  "material_ui"
], function(React, ReactDOM, MaterialUi) {
  "use strict";


  const AlerterComponent = React.createClass({
    propTypes: {
      alertTitle: React.PropTypes.string,
      alertMessage: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]),
      okButtonLabel: React.PropTypes.string
    },


    getDefaultProps: function() {
      return {
        alertTitle: "Alert",
        okButtonLabel: "OK"
      };
    },


    getInitialState() {
      return {open: true};
    },


    render() {
      const MuiThemeProvider = MaterialUi.MuiThemeProvider;
      const Dialog = MaterialUi.Dialog;
      const FlatButton = MaterialUi.FlatButton;

      const actions = <FlatButton label={this.props.okButtonLabel} secondary={true} onTouchTap={this.handleClose} />;

      return (
        <MuiThemeProvider muiTheme={MaterialUi.getMuiTheme()}>
          <Dialog title={this.props.alertTitle} actions={actions} modal={true} open={this.state.open}>
            {this.props.alertMessage}
          </Dialog>
        </MuiThemeProvider>
      );
    },


    componentWillReceiveProps() {
      this.setState({open: true});
    },


    handleClose() {
      this.setState({open: false});
    }
  });


  var alerter = function(alertMessage, okButtonLabel, alertTitle, domContainerNode) {
    ReactDOM.render(<AlerterComponent alertTitle={alertTitle} alertMessage={alertMessage} okButtonLabel={okButtonLabel} />, domContainerNode);
  };


  return alerter;
});