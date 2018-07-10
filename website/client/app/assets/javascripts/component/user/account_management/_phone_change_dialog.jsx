modulejs.define("component/user/account_management/_phone_change_dialog", [
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/constant",
  "app/utility",
  "app/cached_request",
  "app/error_handler",
  "model/user"
], function(logger, React, MaterialUi, validator, constant, utility, cachedRequest,
  errorHandler, userModel
) {
  "use strict";


  const UserAccountmanagementPhonechangedialogComponent = React.createClass({
    propTypes: {
      open: React.PropTypes.bool,
      onRequestClose: React.PropTypes.func,
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
        onRequestClose: function() {},
        phoneSetCallback: function() {}
      };
    },


    getInitialState() {
      return {
        loading: false,
        phone: "",
        phoneError: ""
      };
    },


    render() {
      const Dialog = MaterialUi.Dialog;
      const RaisedButton = MaterialUi.RaisedButton;
      const TextField = MaterialUi.TextField;
      const CircularProgress = MaterialUi.CircularProgress;

      var saveButton = null;
      if (this.state.loading) {
        saveButton = (<div className="haigy-text-align-center"><CircularProgress size={0.5} /><br /><span>...</span></div>);
      } else {
        saveButton = (<div><RaisedButton className="haigy-width-100-percent" label="Save" type="submit" primary={true} /></div>);
      }

      var header = null;
      if (this.props.phone) {
        header = "Change Phone Number";
      } else {
        header = "Set Phone Number";
      }

      var content = (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-400px haigy-text-align-left">
            <br />
            <strong className="haigy-font-large">{header}</strong>
            <form onSubmit={this.onSubmit}>
              <div>
                <TextField
                  floatingLabelText="Phone Number" type="text" fullWidth={true}
                  value={this.state.phone} onChange={this.onPhoneChange}
                  errorText={this.state.phoneError}
                />
              </div>
              <br />
              {saveButton}
              <br />
            </form>
          </div>
        </div>
      );

      return (
        <Dialog
          open={this.props.open}
          onRequestClose={this.props.onRequestClose}
          autoDetectWindowHeight={false}
          style={constant.materialUi.DIALOG_STYLE}
        >
          {content}
        </Dialog>
      );
    },


    componentWillMount() {
      this.getPhone(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getPhone(nextProps);
    },


    getPhone(props) {
      this.setState({phone: props.phone});
    },


    onPhoneChange(event) {
      this.setState({
        phone: utility.lib.formattedUsPhoneNumber(event.currentTarget.value),
        phoneError: ""
      });
    },


    onSubmit(event) {
      event.preventDefault();

      if (this.state.loading !== true) {
        var that = this;

        var phone = that.state.phone;
        var inputValid = validator.usPhone(phone, function(invalidMessage) {
          that.setState({phoneError: invalidMessage});
        });

        if (inputValid) {
          if (that.props.userId) {
            that.setState({loading: true});
            cachedRequest.saveModel(userModel, {
              id: that.props.userId,
              phone: phone
            }, {
              success: function(savedUser) {
                var savedPhone = savedUser.get("phone");
                that.setState({loading: false, phone: savedPhone});
                that.props.phoneSetCallback(savedPhone);
                that.props.onRequestClose();
              },

              error: function(model, jqXHR) {
                logger(jqXHR);
                errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
              }
            });
          } else {
            that.props.phoneSetCallback(phone);
            that.props.onRequestClose();
          }
        }
      }
    }
  });


  return UserAccountmanagementPhonechangedialogComponent;
});