modulejs.define("component/user/account_management/_password_change_dialog", [
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/constant",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "model/user"
], function(logger, React, MaterialUi, validator, constant, cachedRequest, navigator,
  errorHandler, userModel
) {
  "use strict";


  const UserAccountmanagementPasswordchangedialogComponent = React.createClass({
    propTypes: {
      open: React.PropTypes.bool,
      onRequestClose: React.PropTypes.func,
      userId: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
      ]),
      newPasswordSetCallback: React.PropTypes.func
    },


    getDefaultProps: function() {
      return {
        userId: null,
        onRequestClose: function() {},
        newPasswordSetCallback: function() {}
      };
    },


    getInitialState() {
      return {
        loading: false,
        currentPassword: "",
        currentPasswordError: "",
        newPassword: "",
        newPasswordError: "",
        repeatPassword: "",
        repeatPasswordError: ""
      };
    },


    render() {
      const Dialog = MaterialUi.Dialog;
      var content = null;

      if (this.props.userId) {
        const RaisedButton = MaterialUi.RaisedButton;
        const TextField = MaterialUi.TextField;
        const CircularProgress = MaterialUi.CircularProgress;

        var saveButton = null;
        if (this.state.loading) {
          saveButton = (<div className="haigy-text-align-center"><CircularProgress size={0.5} /><br /><span>...</span></div>);
        } else {
          saveButton = (<div><RaisedButton className="haigy-width-100-percent" label="Save" type="submit" primary={true} /></div>);
        }

        content = (
          <div className="haigy-width-100-percent haigy-text-align-center">
            <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-400px haigy-text-align-left">
              <br />
              <strong className="haigy-font-large">Change Password</strong>
              <form onSubmit={this.onSubmit}>
                <div>
                  <TextField
                    floatingLabelText="Your Current Password" type="password"
                    fullWidth={true} value={this.state.currentPassword} onChange={this.onCurrentPasswordChange}
                    errorText={this.state.currentPasswordError}
                  />
                </div>
                <br />
                <div>
                  <TextField
                    floatingLabelText="New Password" type="password"
                    fullWidth={true} value={this.state.newPassword} onChange={this.onNewPasswordChange}
                    errorText={this.state.newPasswordError}
                  />
                </div>
                <div>
                  <TextField
                    floatingLabelText="Repeat New Password" type="password"
                    fullWidth={true} value={this.state.repeatPassword} onChange={this.onRepeatPasswordChange}
                    errorText={this.state.repeatPasswordError}
                  />
                </div>
                <br />
                {saveButton}
                <br />
                <div className="haigy-width-100-percent haigy-text-align-center">
                  <a href="#" onClick={this.onPasswordRecovery}>Forgot your password?</a>
                </div>
                <br />
              </form>
            </div>
          </div>
        );
      } else {
        content = <div>You might need to sign in first.</div>;
      }

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


    onCurrentPasswordChange(event) {
      this.setState({currentPassword: event.currentTarget.value, currentPasswordError: ""});
    },


    onNewPasswordChange(event) {
      this.setState({newPassword: event.currentTarget.value, newPasswordError: "", repeatPasswordError: ""});
    },


    onRepeatPasswordChange(event) {
      this.setState({repeatPassword: event.currentTarget.value, repeatPasswordError: ""});
    },


    onSubmit(event) {
      event.preventDefault();

      if (this.state.loading !== true) {
        var that = this;

        var allInputValid = true;
        allInputValid = validator.password(that.state.currentPassword, function(invalidMessage) {
          that.setState({currentPasswordError: invalidMessage});
        }) && allInputValid;

        allInputValid = validator.password(that.state.newPassword, function(invalidMessage) {
          that.setState({newPasswordError: invalidMessage});
        }) && allInputValid;

        if (that.state.repeatPassword !== that.state.newPassword) {
          allInputValid = false;
          that.setState({repeatPasswordError: "The repeated password doesn't match the new password."});
        }

        if (allInputValid) {
          that.setState({loading: true});
          cachedRequest.saveModel(userModel, {
            id: that.props.userId,
            new_password: that.state.newPassword,
            password: that.state.currentPassword
          }, {
            success: function() {
              that.setState({loading: false});
              that.props.newPasswordSetCallback();
              that.props.onRequestClose();
            },

            error: function(model, jqXHR) {
              if (jqXHR && jqXHR.responseJSON) {
                var errorCode = jqXHR.responseJSON.error_code;

                switch(errorCode) {
                case constant.errorCode.AUTHENTICATION_FAILED:
                  that.setState({loading: false, currentPasswordError: "Authentication Failed. The password is not correct."});
                  break;
                default:
                  logger(jqXHR);
                  errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
                }
              } else {
                logger(jqXHR);
              }
              that.setState({loading: false});
            }
          });
        }
      }
    },


    onPasswordRecovery(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.props.onRequestClose();
      navigator.userRecoverpassword();
    }
  });


  return UserAccountmanagementPasswordchangedialogComponent;
});