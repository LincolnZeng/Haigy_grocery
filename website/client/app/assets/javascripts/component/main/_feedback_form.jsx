modulejs.define("component/main/_feedback_form", [
  "logger",
  "alerter",
  "react",
  "material_ui",
  "lib/validator",
  "app/cookie",
  "app/cached_request",
  "app/error_handler",
  "app/utility",
  "app/navigator",
  "model/feedback",
  "component/main/_loading"
], function(logger, alerter, React, MaterialUi, validator, cookie, cachedRequest,
  errorHandler, utility, navigator, feedbackModel, MainLoadingComponent
) {
  "use strict";


  const CONTACT_REQUIRE_MESSAGE = "Please provide us at least one contact method. So we can contact you back. Thanks!";


  var MainFeedbackformComponent = React.createClass({
    propTypes: {
      formHeader: React.PropTypes.string.isRequired,
      formDescription: React.PropTypes.string.isRequired,
      contentHintText: React.PropTypes.string.isRequired,
      contentType: React.PropTypes.string.isRequired,
      requireContactMethod: React.PropTypes.bool.isRequired,
      feedbackSavedReminderMessage: React.PropTypes.string.isRequired
    },


    getInitialState() {
      return {
        loading: false,
        feedbackSaved: false,
        content: "",
        contentError: "",
        email: "",
        emailError: "",
        phone: "",
        phoneError: ""
      };
    },


    render() {
      var content = null;

      if (this.state.loading) {
        content = <div><br /><MainLoadingComponent loadingMessage="Saving ..." /><br /><br /></div>;
      } else if (this.state.feedbackSaved) {
        content = <div><br />{this.props.feedbackSavedReminderMessage}<br /><br /></div>;
      } else {
        const RaisedButton = MaterialUi.RaisedButton;
        const TextField = MaterialUi.TextField;

        var emailLabel = "Your Email";
        var phoneLabel = "Your Phone Number";
        var contactMethodRequiredReminder = null;
        if (this.props.requireContactMethod) {
          contactMethodRequiredReminder = (
            <div>
              <br />
              <div>{CONTACT_REQUIRE_MESSAGE}</div>
              <br />
            </div>
          );
        } else {
          emailLabel += " (Optional)";
          phoneLabel += " (Optional)";
        }

        content = (
          <div>
            <form onSubmit={this.onSubmit}>
              <div>{this.props.formDescription}</div>
              <br />
              <div>
                <TextField
                  floatingLabelText={this.props.contentHintText} multiLine={true} fullWidth={true}
                  value={this.state.content} onChange={this.onContentChange}
                  errorText={this.state.contentError}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText={emailLabel} fullWidth={true}
                  value={this.state.email} onChange={this.onEmailChange}
                  errorText={this.state.emailError}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText={phoneLabel} fullWidth={true}
                  value={this.state.phone} onChange={this.onPhoneChange}
                  errorText={this.state.phoneError}
                />
              </div>

              <br />{contactMethodRequiredReminder}<br />

              <div><RaisedButton fullWidth={true} label="Submit" type="submit" primary={true} /></div>
              <br />
            </form>
          </div>
        );
      }

      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-500px haigy-text-align-left haigy-font-italic">
            <h2>{this.props.formHeader}</h2>
            <br />
            {content}
          </div>
          <br /><br /><br />
          <div><a href="#" onClick={this.goBack}><i>Back to the Previous Page</i></a></div>
        </div>
      );
    },


    componentWillMount() {
      this.getUserData();
    },


    componentWillReceiveProps() {
      this.setState(this.getInitialState());
      this.getUserData();
    },


    getUserData() {
      this.setState({
        email: cookie.user.getEmail() || "",
        phone: utility.lib.formattedUsPhoneNumber(cookie.user.getPhone() || "")
      });
    },


    onContentChange(event) {
      this.setState({content: event.currentTarget.value, contentError: ""});
    },


    onEmailChange(event) {
      this.setState({email: event.currentTarget.value, emailError: ""});
    },


    onPhoneChange(event) {
      this.setState({phone: utility.lib.formattedUsPhoneNumber(event.currentTarget.value), phoneError: ""});
    },


    onSubmit(event) {
      event.preventDefault();

      var that = this;
      var hasEmail = that.state.email && that.state.email.length > 0;
      var hasPhone = that.state.phone && that.state.phone.length > 0;
      var allInputValid = true;

      allInputValid = validator.minLength(that.state.content, 1, true, function() {
        that.setState({contentError: "This field cannot be blank."});
      }) && allInputValid;

      if (hasEmail) {
        allInputValid = validator.email(that.state.email, function(invalidMessage) {
          that.setState({emailError: invalidMessage});
        }) && allInputValid;
      }

      if (hasPhone) {
        allInputValid = validator.usPhone(that.state.phone, function(invalidMessage) {
          that.setState({phoneError: invalidMessage});
        }) && allInputValid;
      }

      if (allInputValid) {
        if (that.props.requireContactMethod && !hasEmail && !hasPhone) {
          alerter(CONTACT_REQUIRE_MESSAGE);
        } else {
          var feedbackData = {
            content_type: that.props.contentType,
            content: that.state.content,
            user_id: cookie.user.getUserId(),
            user_local_time: (new Date()).toLocaleString(),
            user_email: that.state.email,
            user_phone: that.state.phone
          };

          that.setState({loading: true});

          cachedRequest.saveModel(feedbackModel, feedbackData, {
            success: function() {
              that.setState({loading: false, feedbackSaved: true});
            },

            error: function(model, jqXHR) {
              logger(jqXHR);
              errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
              that.setState({loading: false});
            }
          });
        }
      }
    },


    goBack: function(event) {
      event.preventDefault();
      event.currentTarget.blur();
      navigator.back();
    }
  });


  return MainFeedbackformComponent;
});