modulejs.define("component/user/_sign_in_form", [
  "alerter",
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/cached_request",
  "app/cookie",
  "app/navigator",
  "helper/session",
  "model/session"
], function(alerter, logger, React, MaterialUi, validator, cachedRequest, cookie,
  navigator, sessionHelper, sessionModel
) {
  "use strict";


  var UserSigninformComponent = React.createClass({
    propTypes: {
      formHeader: React.PropTypes.string.isRequired,
      justBeforePasswordRecovery: React.PropTypes.func,
      signInSuccessCallback: React.PropTypes.func,
      signInErrorCallback: React.PropTypes.func
    },


    getDefaultProps: function() {
      return {
        formHeader: "Sign In",
        justBeforePasswordRecovery: function() {},
        signInSuccessCallback: function() {},
        signInErrorCallback: function() {}
      };
    },


    getInitialState() {
      return {
        email: "",
        emailError: "",
        password: "",
        passwordError: "",
        loading: false
      };
    },


    render() {
      const RaisedButton = MaterialUi.RaisedButton;
      const TextField = MaterialUi.TextField;
      const CircularProgress = MaterialUi.CircularProgress;

      var submitButton = null;
      if (this.state.loading) {
        submitButton = (<div className="haigy-text-align-center"><CircularProgress size={0.5} /><br /><span>...</span></div>);
      } else {
        submitButton = (<div><RaisedButton className="haigy-width-100-percent" label="Submit" type="submit" primary={true} /></div>);
      }

      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-300px haigy-text-align-left">
            <br />
            <div className="haigy-font-size-150"><strong>{this.props.formHeader}</strong></div>

            <form onSubmit={this.onSubmit}>
              <div>
                <TextField
                  floatingLabelText="Email" type="text" fullWidth={true}
                  value={this.state.email} onChange={this.onEmailChange}
                  errorText={this.state.emailError}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText="Password" type="password"
                  fullWidth={true} value={this.state.password} onChange={this.onPasswordChange}
                  errorText={this.state.passwordError}
                />
              </div>

              <br />
              {submitButton}
              <br />
              <div className="haigy-width-100-percent haigy-text-align-center">
                <a href="#" onClick={this.onPasswordRecovery}>Forgot your password?</a>
              </div>
              <br />
            </form>
          </div>
        </div>
      );
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

        var allInputValid = true;
        allInputValid = validator.email(that.state.email, function(invalidMessage) {
          that.setState({emailError: invalidMessage});
        }) && allInputValid;

        allInputValid = validator.password(that.state.password, function(invalidMessage) {
          that.setState({passwordError: invalidMessage});
        }) && allInputValid;

        if (allInputValid) {
          that.setState({loading: true});

          cachedRequest.saveModel(sessionModel, {
            email: that.state.email,
            password: that.state.password
          }, {
            success: function(newSession) {
              that.setState({loading: false});
              sessionHelper.setSession(
                newSession.get("user"),
                newSession.get("cart_id"),
                newSession.get("cart_entry")
              );
              that.props.signInSuccessCallback();
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              alerter(jqXHR.responseJSON.error_message);
              that.setState({loading: false});
              that.props.signInErrorCallback();
            }
          });
        }
      }
    },


    onPasswordRecovery(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.props.justBeforePasswordRecovery();
      navigator.userRecoverpassword();
    }
  });


  return UserSigninformComponent;
});