modulejs.define("component/order/checkout/_setting_template", [
  "react",
  "material_ui",
  "app/constant"
], function(React, MaterialUi, constant) {
  "use strict";


  const OrderCheckoutSettingtemplateComponent = React.createClass({
    propTypes: {
      header: React.PropTypes.string,
      children: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]),
      dialogOpen: React.PropTypes.bool,
      dialogContent: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ]),
      enableClick: React.PropTypes.bool,
      onClick: React.PropTypes.func,
      onDialogClose: React.PropTypes.func
    },


    getDefaultProps: function() {
      return {
        dialogOpen: false,
        enableClick: false
      };
    },


    render() {
      const Dialog = MaterialUi.Dialog;

      var containerClass = null;
      if (this.props.enableClick) {
        containerClass = "ui fluid link card";
      } else {
        containerClass = "ui fluid card";
      }

      return (
        <div className={containerClass} title="Click to modify" onClick={this.onClick}>
          <div className="content">
            <h4 className="ui header">{this.props.header}</h4>
            <div className="description haigy-padding-l-30px haigy-padding-r-30px">
              {this.props.children}
            </div>
          </div>

          <Dialog
            open={this.props.enableClick && this.props.dialogOpen}
            onRequestClose={this.onRequestClose}
            autoDetectWindowHeight={false}
            style={constant.materialUi.DIALOG_STYLE}
          >
            {this.props.dialogContent}
          </Dialog>
        </div>
      );
    },


    onClick(event) {
      if (this.props.enableClick && this.props.onClick) {
        this.props.onClick(event);
      }
    },


    onRequestClose() {
      if (this.props.enableClick && this.props.onDialogClose) {
        this.props.onDialogClose();
      }
    }
  });


  return OrderCheckoutSettingtemplateComponent;
});