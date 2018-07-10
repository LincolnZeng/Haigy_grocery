modulejs.define("component/session/sign_in", [
  "alerter",
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/cached_request",
  "app/cookie",
  "app/navigator",
  "model/session"
], function(alerter, logger, React, MaterialUi, validator, cachedRequest, cookie,
  navigator, modelSession
) {
  "use strict";


  var SessionSigninComponent = React.createClass({
    render: function() {
      const RaisedButton = MaterialUi.RaisedButton;
      const TextField = MaterialUi.TextField;
      const CircularProgress = MaterialUi.CircularProgress;

      var submitButton = null;
      if (this.state.loading) {
        submitButton = (<div className="haigy-text-align-center"><CircularProgress size={0.5} /><br /><span>...</span></div>);
      } else {
        submitButton = (<div><RaisedButton type="submit" className="haigy-width-100-percent" label="Submit" primary={true} /></div>);
      }

      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-300px haigy-text-align-left">
            <br />
            <h2>Sign In</h2>

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
            </form>
          </div>
        </div>
      );
    },


    getInitialState: function() {
      return {
        email: "",
        password: "",
        emailError: "",
        passwordError: "",
        loading: false
      };
    },


    onEmailChange: function(event) {
      this.setState({email: event.currentTarget.value, emailError: ""});
    },


    onPasswordChange: function(event) {
      this.setState({password: event.currentTarget.value, passwordError: ""});
    },


    onSubmit: function(event) {
      event.preventDefault();

      if (this.state.loading !== true) {
        var that = this;

        var allInputValid = true;
        allInputValid = validator.email(this.state.email, function(invalidMessage) {
          that.setState({emailError: invalidMessage});
        }) && allInputValid;

        allInputValid = validator.password(this.state.password, function(invalidMessage) {
          that.setState({passwordError: invalidMessage});
        }) && allInputValid;

        if (allInputValid) {
          that.setState({loading: true});

          cachedRequest.saveModel(modelSession, {
            email: that.state.email,
            password: that.state.password
          }, {
            success: function(newSession) {
              var employeeId = newSession.get("employee_id").toString();
              if (employeeId !== cookie.employee.getEmployeeId()) {
                cookie.clearAllUserRelatedCookie();
                cookie.employee.setEmployeeId(employeeId);
              }
              navigator.refresh();
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              alerter(jqXHR.responseJSON.error_message);
              that.setState({loading: false});
            }
          });
        }
      }
    }
  });


  return SessionSigninComponent;
});