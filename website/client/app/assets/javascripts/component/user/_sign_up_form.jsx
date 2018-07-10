modulejs.define("component/user/_sign_up_form", [
  "alerter",
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/constant",
  "app/utility",
  "app/cached_request",
  "app/error_handler",
  "app/cookie",
  "app/navigator",
  "helper/cart",
  "helper/session",
  "model/user"
], function(alerter, logger, React, MaterialUi, validator, constant, utility,
  cachedRequest, errorHandler, cookie, navigator, cartHelper, sessionHelper, userModel
) {
  "use strict";


  var UserSignupformComponent = React.createClass({
    propTypes: {
      formHeader: React.PropTypes.string.isRequired,
      signUpSuccessCallback: React.PropTypes.func,
      signUpErrorCallback: React.PropTypes.func,
      hasPhoneInput: React.PropTypes.bool,
      userId: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
      ]),
      email: React.PropTypes.string,
      phone: React.PropTypes.string,
      address: React.PropTypes.object
    },


    getDefaultProps: function() {
      return {
        formHeader: "Sign Up",
        signUpSuccessCallback: function() {},
        signUpErrorCallback: function() {},
        hasPhoneInput: false
      };
    },


    getInitialState() {
      return {
        email: "",
        emailError: "",
        phone: "",
        phoneError: "",
        zipCode: "",
        zipCodeError: "",
        password: "",
        passwordError: "",
        repeatPassword: "",
        repeatPasswordError: "",
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
                  floatingLabelText={<span>Email <span className="haigy-font-color-red">*</span></span>}
                  type="text" fullWidth={true} value={this.state.email}
                  onChange={this.onEmailChange} errorText={this.state.emailError}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText="Phone Number" type="text" fullWidth={true}
                  value={this.state.phone} onChange={this.onPhoneChange}
                  errorText={this.state.phoneError}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText={<span>Delivery Zip Code <span className="haigy-font-color-red">*</span></span>}
                  type="text" fullWidth={true} value={this.state.zipCode}
                  onChange={this.onZipCodeChange} errorText={this.state.zipCodeError}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText={<span>Password <span className="haigy-font-color-red">*</span></span>}
                  type="password" fullWidth={true} value={this.state.password}
                  onChange={this.onPasswordChange} errorText={this.state.passwordError}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText="Repeat Password" type="password"
                  fullWidth={true} value={this.state.repeatPassword} onChange={this.onRepeatPasswordChange}
                  errorText={this.state.repeatPasswordError}
                />
              </div>

              <br />

              {submitButton}
              <br />
            </form>
          </div>
        </div>
      );
    },


    initializeData(props) {
      var zipCode = "";
      var address = props.address;
      if (address && address.zipCode) {
        zipCode = address.zipCode;
      }
      var email = props.email || "";
      var phone = props.phone || "";
      this.setState({email: email, phone: phone, zipCode: zipCode});
    },


    componentWillMount() {
      this.initializeData(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.getInitialState();
      this.initializeData(nextProps);
    },


    onEmailChange(event) {
      this.setState({email: event.currentTarget.value, emailError: ""});
    },


    onPhoneChange(event) {
      this.setState({
        phone: utility.lib.formattedUsPhoneNumber(event.currentTarget.value),
        phoneError: ""
      });
    },


    onZipCodeChange(event) {
      this.setState({zipCode: event.currentTarget.value, zipCodeError: ""});
    },


    onPasswordChange(event) {
      this.setState({password: event.currentTarget.value, passwordError: "", repeatPasswordError: ""});
    },


    onRepeatPasswordChange(event) {
      this.setState({repeatPassword: event.currentTarget.value, repeatPasswordError: ""});
    },


    onSubmit(event) {
      event.preventDefault();

      if (this.state.loading !== true) {
        var that = this;

        var allInputValid = true;
        allInputValid = validator.email(that.state.email, function(invalidMessage) {
          that.setState({emailError: invalidMessage});
        }) && allInputValid;

        if (that.props.hasPhoneInput && that.state.phone && that.state.phone.length > 0) {
          allInputValid = validator.usPhone(that.state.phone, function(invalidMessage) {
            that.setState({phoneError: invalidMessage});
          }) && allInputValid;
        }

        allInputValid = validator.usZipCode(that.state.zipCode, function(invalidMessage) {
          that.setState({zipCodeError: invalidMessage});
        }) && allInputValid;

        allInputValid = validator.password(that.state.password, function(invalidMessage) {
          that.setState({passwordError: invalidMessage});
        }) && allInputValid;

        if (that.state.repeatPassword !== that.state.password) {
          allInputValid = false;
          that.setState({repeatPasswordError: "The repeated password doesn't match the password."});
        }

        if (allInputValid) {
          that.setState({loading: true});

          var userId = that.props.userId;
          var signUpData = {
            email: that.state.email,
            phone: that.state.phone,
            zip_code: that.state.zipCode,
            password: that.state.password,
            repeat_password: that.state.repeatPassword
          };

          if (userId && userId.toString().length > 0) {
            signUpData.user_id = userId;
          } else {
            signUpData.cart = cartHelper.getServerRequiredCartInfo();
          }

          var address = that.props.address;
          if (address && address.zipCode) {
            var addressData = {
              is_business_address: address.isBusinessAddress,
              business_name: address.businessName,
              input_address: address.formattedAddress,
              note: address.note
            };
            signUpData.address = addressData;
          }

          cachedRequest.saveModel(userModel, signUpData, {
            success: function(createdUser) {
              that.setState({loading: false});
              var session = createdUser.get("session");
              sessionHelper.setSession(session.user, session.cart_id, session.cart_entry);
              that.props.signUpSuccessCallback();
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
                default:
                  logger(jqXHR);
                  errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
                  return;
                }
              } else {
                logger(jqXHR);
              }

              that.setState({loading: false});
              that.props.signUpErrorCallback();
            }
          });
        }
      }
    }
  });


  return UserSignupformComponent;
});