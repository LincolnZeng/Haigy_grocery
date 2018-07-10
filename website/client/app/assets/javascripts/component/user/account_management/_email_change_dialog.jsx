modulejs.define("component/user/account_management/_email_change_dialog", [
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/constant",
  "app/cached_request",
  "app/error_handler",
  "model/user"
], function(logger, React, MaterialUi, validator, constant, cachedRequest,
  errorHandler, userModel
) {
  "use strict";


  const UserAccountmanagementEmailchangedialogComponent = React.createClass({
    propTypes: {
      open: React.PropTypes.bool,
      onRequestClose: React.PropTypes.func,
      email: React.PropTypes.string,
      userId: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
      ]),
      emailSetCallback: React.PropTypes.func
    },


    getDefaultProps: function() {
      return {
        userId: null,
        onRequestClose: function() {},
        emailSetCallback: function() {}
      };
    },


    getInitialState() {
      return {
        loading: false,
        email: "",
        emailError: "",
        password: "",
        passwordError: ""
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
      if (this.props.email) {
        header = "Change Email";
      } else {
        header = "Set Email";
      }

      var passwordVerificationFields = null;
      if (this.props.userId) {
        passwordVerificationFields = (
          <div>
            <TextField
              floatingLabelText="Your Password" type="password"
              fullWidth={true} value={this.state.password} onChange={this.onPasswordChange}
              errorText={this.state.passwordError}
            />
          </div>
        );
      }

      var content = (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-400px haigy-text-align-left">
            <br />
            <strong className="haigy-font-large">{header}</strong>
            <form onSubmit={this.onSubmit}>
              <div>
                <TextField
                  floatingLabelText="Email" type="text" fullWidth={true}
                  value={this.state.email} onChange={this.onEmailChange}
                  errorText={this.state.emailError}
                />
              </div>
              {passwordVerificationFields}
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
      this.getEmail(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getEmail(nextProps);
    },


    getEmail(props) {
      this.setState({email: props.email});
    },


    onEmailChange(event) {
      this.setState({email: event.currentTarget.value, emailError: ""});
    },


    onPasswordChange(event) {
      this.setState({password: event.currentTarget.value, passwordError: ""});
    },


    onSubmit(event) {
      event.preventDefault();

      if (this.state.loading !== true) {
        var that = this;

        var email = that.state.email.trim();
        var allInputValid = true;
        allInputValid = validator.email(email, function(invalidMessage) {
          that.setState({emailError: invalidMessage});
        }) && allInputValid;

        if (that.props.userId) {
          allInputValid = validator.password(that.state.password, function(invalidMessage) {
            that.setState({passwordError: invalidMessage});
          }) && allInputValid;

          if (allInputValid) {
            that.setState({loading: true});
            cachedRequest.saveModel(userModel, {
              id: that.props.userId,
              email: email,
              password: that.state.password
            }, {
              success: function(savedUser) {
                var savedEmail = savedUser.get("email");
                that.setState({loading: false, email: savedEmail});
                that.props.emailSetCallback(savedEmail);
                that.props.onRequestClose();
              },

              error: function(model, jqXHR) {
                if (jqXHR && jqXHR.responseJSON) {
                  var errorCode = jqXHR.responseJSON.error_code;

                  switch(errorCode) {
                  case constant.errorCode.INVALID_EMAIL:
                    that.setState({loading: false, emailError: "The email address is invalid."});
                    break;
                  case constant.errorCode.EMAIL_REGISTERED:
                    that.setState({loading: false, emailError: "The email address has been registered."});
                    break;
                  case constant.errorCode.AUTHENTICATION_FAILED:
                    that.setState({loading: false, passwordError: "Authentication Failed. The password is not correct."});
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
        } else {
          if (allInputValid) {
            that.props.emailSetCallback(email);
            that.props.onRequestClose();
          }
        }
      }
    }
  });


  return UserAccountmanagementEmailchangedialogComponent;
});