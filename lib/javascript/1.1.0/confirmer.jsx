modulejs.define("haigy/lib/1.1.0/confirmer", [
  "react",
  "reactdom",
  "material_ui"
], function(React, ReactDOM, MaterialUi) {
  "use strict";


  const ConfirmerComponent = React.createClass({
    propTypes: {
      open: React.PropTypes.bool,
      confirmTitle: React.PropTypes.string,
      confirmMessage: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]),
      okCallback: React.PropTypes.func.isRequired,
      cancelCallback: React.PropTypes.func.isRequired,
      okButtonLabel: React.PropTypes.string,
      cancelButtonLabel: React.PropTypes.string
    },


    getDefaultProps: function() {
      return {
        open: false,
        confirmTitle: "Confirm",
        okButtonLabel: "OK",
        cancelButtonLabel: "Cancel"
      };
    },


    getInitialState() {
      return {open: true};
    },


    render() {
      const MuiThemeProvider = MaterialUi.MuiThemeProvider;
      const Dialog = MaterialUi.Dialog;
      const FlatButton = MaterialUi.FlatButton;

      const actions = [
        <FlatButton label={this.props.cancelButtonLabel} secondary={true} onTouchTap={this.handleCancel} />,
        <FlatButton label={this.props.okButtonLabel} primary={true} keyboardFocused={true} onTouchTap={this.handleOk} />
      ];

      return (
        <MuiThemeProvider muiTheme={MaterialUi.getMuiTheme()}>
          <Dialog title={this.props.confirmTitle} actions={actions} modal={true} open={this.props.open && this.state.open}>
            {this.props.confirmMessage}
          </Dialog>
        </MuiThemeProvider>
      );
    },


    componentWillReceiveProps() {
      this.setState({open: true});
    },


    handleOk() {
      this.setState({open: false});
      this.props.okCallback();
    },


    handleCancel() {
      this.setState({open: false});
      this.props.cancelCallback();
    }
  });


  var Confirmer = function(domContainerNode, confirmMessage, okCallback, cancelCallback, okButtonLabel, cancelButtonLabel) {
    this.isModalOpen = false;
    this.domContainerNode = domContainerNode;
    this.setAttributes(confirmMessage, okCallback, cancelCallback, okButtonLabel, cancelButtonLabel);
  };


  Confirmer.prototype.setAttributes = function(confirmMessage, okCallback, cancelCallback, okButtonLabel, cancelButtonLabel, confirmTitle) {
    this.confirmTitle = confirmTitle;
    this.confirmMessage = confirmMessage;
    this.okCallback = okCallback;
    this.cancelCallback = cancelCallback;
    this.okButtonLabel = okButtonLabel;
    this.cancelButtonLabel = cancelButtonLabel;
  };


  Confirmer.prototype.hasDomContainerNode = function() {
    if (this.domContainerNode) {
      return true;
    } else {
      return false;
    }
  };


  Confirmer.prototype.isOpen = function() {
    return this.isModalOpen;
  };


  Confirmer.prototype.open = function() {
    if (this.domContainerNode) {
      ReactDOM.render(
        <ConfirmerComponent
          open={true}
          confirmTitle={this.confirmTitle}
          confirmMessage={this.confirmMessage}
          okCallback={this.okCallback}
          cancelCallback={this.cancelCallback}
          okButtonLabel={this.okButtonLabel}
          cancelButtonLabel={this.cancelButtonLabel}
        />,
        this.domContainerNode
      );

      this.isModalOpen = true;
    }
  };


  Confirmer.prototype.close = function() {
    if (this.domContainerNode) {
      ReactDOM.render(
        <ConfirmerComponent
          open={false}
          confirmTitle={this.confirmTitle}
          confirmMessage={this.confirmMessage}
          okCallback={this.okCallback}
          cancelCallback={this.cancelCallback}
          okButtonLabel={this.okButtonLabel}
          cancelButtonLabel={this.cancelButtonLabel}
        />,
        this.domContainerNode
      );

      this.isModalOpen = false;
    }
  };


  return Confirmer;
});