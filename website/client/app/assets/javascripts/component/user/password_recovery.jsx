modulejs.define("component/user/password_recovery", [
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/constant",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "collection/user/recover_password"
], function(logger, React, MaterialUi, validator, constant, cachedRequest,
  navigator, errorHandler, userRecoverpasswordCollection
) {
  "use strict";


  var UserPasswordrecoveryComponent = React.createClass({
    getInitialState() {
      return {
        email: "",
        emailError: "",
        loading: false,
        temporaryPasswordGenerated: false,
        temporaryPasswordLifetime: 0
      };
    },


    render() {
      const RaisedButton = MaterialUi.RaisedButton;
      const TextField = MaterialUi.TextField;
      const CircularProgress = MaterialUi.CircularProgress;

      var content = null;
      if (this.state.temporaryPasswordGenerated) {
        content = (
          <div>
            <br />
            <div><i>
              A temporary password has been sent to your email address: {this.state.email}
            </i></div>
            <br />
            <div><i>
              You may sign in with this temporary password within next {this.state.temporaryPasswordLifetime} minutes, and reset your password.
            </i></div>
          </div>
        );
      } else {
        var submitButton = null;
        if (this.state.loading) {
          submitButton = (<div className="haigy-text-align-center"><CircularProgress size={0.5} /><br /><span>...</span></div>);
        } else {
          submitButton = (<div><RaisedButton className="haigy-width-100-percent" label="Submit" type="submit" primary={true} /></div>);
        }

        content = (
          <div>
            <br />
            <div className="haigy-font-size-150"><strong>Recover Password</strong></div>

            <form onSubmit={this.onSubmit}>
              <div>
                <TextField
                  floatingLabelText="Email you use to sign in to Haigy" type="text" fullWidth={true}
                  value={this.state.email} onChange={this.onEmailChange}
                  errorText={this.state.emailError}
                />
              </div>
              <br />
              {submitButton}
            </form>
          </div>
        );
      }

      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-300px haigy-text-align-left">
            {content}
            <br />
            <div className="haigy-width-100-percent haigy-text-align-center">
              <a href="#" onClick={this.goBack}><i>Go Back</i></a>
            </div>
          </div>
        </div>
      );
    },


    componentWillReceiveProps() {
      this.setState(this.getInitialState());
    },


    onEmailChange(event) {
      this.setState({email: event.currentTarget.value, emailError: ""});
    },


    onSubmit(event) {
      event.preventDefault();

      if (this.state.loading !== true) {
        var that = this;

        var inputValid = validator.email(that.state.email, function(invalidMessage) {
          that.setState({emailError: invalidMessage});
        });

        if (inputValid) {
          that.setState({loading: true});

          cachedRequest.fetchCollection(userRecoverpasswordCollection, {}, {
            type: "POST",

            data: {
              email: that.state.email
            },

            success: function(responsedRecoverpasswordCollection) {
              that.setState({
                loading: false,
                temporaryPasswordGenerated: true,
                temporaryPasswordLifetime: responsedRecoverpasswordCollection.getTemporaryPasswordLifetimeInMinutes()
              });
            },

            error: function(model, jqXHR) {
              if (jqXHR && jqXHR.responseJSON) {
                if (jqXHR.responseJSON.error_code === constant.errorCode.RECORD_NOT_FOUND) {
                  that.setState({loading: false, emailError: jqXHR.responseJSON.error_message});
                } else {
                  that.setState({loading: false});
                  logger(jqXHR);
                  errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
                }
              } else {
                that.setState({loading: false});
                var errorMessage = constant.text.UNKNOWN_ERROR;
                logger(errorMessage);
                errorHandler(null, errorMessage);
              }
            }
          });
        }
      }
    },


    goBack(event) {
      event.preventDefault();
      event.currentTarget.blur();
      navigator.back();
    }
  });


  return UserPasswordrecoveryComponent;
});