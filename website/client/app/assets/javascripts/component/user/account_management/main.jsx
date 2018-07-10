modulejs.define("component/user/account_management/main", [
  "logger",
  "react",
  "material_ui",
  "app/constant",
  "app/cookie",
  "app/utility",
  "app/navigator",
  "app/cached_request",
  "app/error_handler",
  "helper/session",
  "collection/order/index",
  "component/user/account_management/_email_change_dialog",
  "component/user/account_management/_password_change_dialog",
  "component/user/account_management/_phone_change_dialog",
  "component/user/account_management/_nickname_change_dialog",
  "component/user/_address_dialog/main",
  "component/user/_sign_up_form",
  "component/main/_loading"
], function(logger, React, MaterialUi, constant, cookie, utility, navigator,
  cachedRequest, errorHandler, sessionHelper, orderIndexCollection,
  UserAccountmanagementEmailchangedialogComponent,
  UserAccountmanagementPasswordchangedialogComponent,
  UserAccountmanagementPhonechangedialogComponent,
  UserAccountmanagementNicknamechangedialogComponent,
  UserAddressdialogMainComponent, UserSignupformComponent, MainLoadingComponent
) {
  "use strict";


  var UserAccountmanagementMainComponent = React.createClass({
    propTypes: {
      currentState: React.PropTypes.shape({
        sessionIsUpToDate: React.PropTypes.bool.isRequired,
        userAttributes: React.PropTypes.shape({
          userId: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
          ]),
          isTemporary: React.PropTypes.bool,
          email: React.PropTypes.string,
          phone: React.PropTypes.string,
          deliveryZipCode: React.PropTypes.string,
          address: React.PropTypes.object
        }).isRequired
      }).isRequired
    },


    getInitialState() {
      return {
        emailChangeDialogOpen: false,
        passwordChangeDialogOpen: false,
        phoneChangeDialogOpen: false,
        nicknameChangeDialogOpen: false,
        addressChangeDialogOpen: false,
        signUpDialogOpen: false,
        passwordDescription: null
      };
    },


    render() {
      var content = null;
      if (this.props.currentState.sessionIsUpToDate) {
        var userAttributes = this.props.currentState.userAttributes;
        var userId = userAttributes.userId;
        var allColors = ["red", "orange", "yellow", "olive", "green", "teal", "blue", "violet", "purple", "pink"];
        var colorCount = allColors.length;
        var nicknameColor = allColors[Math.floor((Math.random() * colorCount))];
        var otherSettingColor = allColors[Math.floor((Math.random() * colorCount))];
        var nickname = userAttributes.nickname;

        var nicknameCard = (
          <div className={[nicknameColor, " card"].join("")}>
            <div className="content">
              <div className="header"><i className={[nicknameColor, " trophy icon"].join("")}></i> Nickname</div>
              <div className="description"><i>
                {(nickname && nickname.trim().length > 0) ? nickname : "Not set yet"}
              </i></div>
            </div>
            <div className="extra content">
              <button className="ui circular right floated icon button" onTouchTap={this.onNicknameChange}><i className="edit icon"></i></button>
            </div>
            <UserAccountmanagementNicknamechangedialogComponent
              open={this.state.nicknameChangeDialogOpen} onRequestClose={this.onAllDialogClose}
              nickname={nickname} userId={userId} nicknameSetCallback={this.nicknameSetCallback}
            />
          </div>
        );

        if (userAttributes.isTemporary) {
          const Dialog = MaterialUi.Dialog;
          content = (
            <div>
              <h2 className="ui header">Guest Account management</h2>
              <br />

              <div className="ui two stackable cards">
                {nicknameCard}

                <div className={[otherSettingColor, " card"].join("")}>
                  <div className="content">
                    <div className="header"><i className={[otherSettingColor, " settings icon"].join("")}></i> Others</div>
                    <div className="description haigy-text-align-center"><i>
                      <div className="haigy-padding-b-5px"><a href={navigator.orderIndexHash}>My order history</a></div>
                      <div className="haigy-padding-b-5px"><a href="#" onClick={this.signUp}>Sign Up</a></div>
                    </i></div>
                  </div>
                  <div className="extra content"><i>
                    <div className="haigy-text-align-right"><a href="#" onClick={this.signOut}>Leave</a></div>
                  </i></div>
                </div>
              </div>

              <Dialog
                open={this.state.signUpDialogOpen}
                onRequestClose={this.closeSignUpDialog}
                autoDetectWindowHeight={false}
                style={constant.materialUi.DIALOG_STYLE}
              >
                <UserSignupformComponent
                  formHeader="Sign Up" hasPhoneInput={true}
                  userId={userAttributes.userId} email={userAttributes.email}
                  phone={userAttributes.phone} address={userAttributes.address}
                  signUpSuccessCallback={this.closeSignUpDialog}
                />
              </Dialog>
            </div>
          );
        } else {
          var emailColor = allColors[Math.floor((Math.random() * colorCount))];
          var passwordColor = allColors[Math.floor((Math.random() * colorCount))];
          var phoneColor = allColors[Math.floor((Math.random() * colorCount))];
          var addressColor = allColors[Math.floor((Math.random() * colorCount))];

          var email = userAttributes.email;
          var phone = userAttributes.phone;
          var deliveryZipCode = userAttributes.deliveryZipCode;
          var address = userAttributes.address;

          var addressContent = null;
          if (address && address.zipCode) {
            var businessName = null;
            if (address.isBusinessAddress && address.businessName && address.businessName.trim().length > 0) {
              businessName = <div>{address.businessName}</div>;
            }
            var addressNote = null;
            if (address.note && address.note.trim().length > 0) {
              addressNote = <div>{address.note}</div>;
            }

            addressContent = (
              <div className="content">
                <div className="header"><i className={[addressColor, " home icon"].join("")}></i> Delivery Address</div>
                <div className="description"><i>
                  {businessName}
                  <div>{address.streetAddress}</div>
                  <div>{address.city}, {address.state} {address.zipCode}</div>
                  {addressNote}
                </i></div>
              </div>
            );
          } else {
            addressContent = (
              <div className="content">
                <div className="header"><i className={[addressColor, " home icon"].join("")}></i> Delivery zip code</div>
                <div className="description"><i>{deliveryZipCode}</i></div>
              </div>
            );
          }

          var passwordDescription = null;
          if (this.state.passwordDescription) {
            passwordDescription = (
              <div className="description"><i>
                {this.state.passwordDescription}
              </i></div>
            );
          }

          content = (
            <div>
              <h2 className="ui header">Account management</h2>
              <br />

              <div className="ui two stackable cards">
                <div className={[emailColor, " card"].join("")}>
                  <div className="content">
                    <div className="header"><i className={[emailColor, " mail icon"].join("")}></i> Email</div>
                    <div className="description"><i>
                      {email}
                    </i></div>
                  </div>
                  <div className="extra content">
                    <button className="ui circular right floated icon button" onTouchTap={this.onEmailChange}><i className="edit icon"></i></button>
                  </div>
                  <UserAccountmanagementEmailchangedialogComponent
                    open={this.state.emailChangeDialogOpen} onRequestClose={this.onAllDialogClose}
                    email={email} userId={userId} emailSetCallback={this.emailSetCallback}
                  />
                </div>

                <div className={[passwordColor, " card"].join("")}>
                  <div className="content">
                    <div className="header"><i className={[passwordColor, " privacy icon"].join("")}></i> Password</div>
                    {passwordDescription}
                  </div>
                  <div className="extra content">
                    <button className="ui circular right floated icon button" onTouchTap={this.onPasswordChange}><i className="edit icon"></i></button>
                  </div>
                  <UserAccountmanagementPasswordchangedialogComponent
                    open={this.state.passwordChangeDialogOpen} onRequestClose={this.onAllDialogClose}
                    userId={userId} newPasswordSetCallback={this.newPasswordSetCallback}
                  />
                </div>

                <div className={[phoneColor, " card"].join("")}>
                  <div className="content">
                    <div className="header"><i className={[phoneColor, " phone icon"].join("")}></i> Phone</div>
                    <div className="description"><i>
                      {(phone && phone.trim().length > 0) ? phone : "Not set yet"}
                    </i></div>
                  </div>
                  <div className="extra content">
                    <button className="ui circular right floated icon button" onTouchTap={this.onPhoneChange}><i className="edit icon"></i></button>
                  </div>
                  <UserAccountmanagementPhonechangedialogComponent
                    open={this.state.phoneChangeDialogOpen} onRequestClose={this.onAllDialogClose}
                    phone={phone} userId={userId} phoneSetCallback={this.phoneSetCallback}
                  />
                </div>

                {nicknameCard}

                <div className={[addressColor, " card"].join("")}>
                  {addressContent}
                  <div className="extra content">
                    <button className="ui circular right floated icon button" onTouchTap={this.onAddressChange}><i className="edit icon"></i> Manage all addresses</button>
                  </div>
                  <UserAddressdialogMainComponent
                    currentState={this.props.currentState} open={this.state.addressChangeDialogOpen}
                    onRequestClose={this.onAllDialogClose} closeAfterAddressSelected={true}
                  />
                </div>

                <div className={[otherSettingColor, " card"].join("")}>
                  <div className="content">
                    <div className="header"><i className={[otherSettingColor, " settings icon"].join("")}></i> Others</div>
                    <div className="description haigy-text-align-center"><i>
                      <div className="haigy-padding-b-5px"><a href={navigator.orderIndexHash}>My order history</a></div>
                    </i></div>
                    <div className="extra content"><i>
                      <div className="haigy-text-align-right"><a href="#" onClick={this.signOut}>Sign out</a></div>
                    </i></div>
                  </div>
                </div>

              </div>
            </div>
          );
        }
      } else {
        content = <MainLoadingComponent />;
      }

      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-800px haigy-text-align-left">
            {content}
          </div>
        </div>
      );
    },


    signUp(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.setState({signUpDialogOpen: true});
    },


    signOut(event) {
      event.preventDefault();
      event.currentTarget.blur();
      sessionHelper.signOut();
    },


    closeSignUpDialog() {
      this.setState({signUpDialogOpen: false});
    },


    onEmailChange() {
      this.setState({emailChangeDialogOpen: true});
    },


    onPasswordChange() {
      this.setState({passwordChangeDialogOpen: true});
    },


    onPhoneChange() {
      this.setState({phoneChangeDialogOpen: true});
    },


    onNicknameChange() {
      this.setState({nicknameChangeDialogOpen: true});
    },


    onAddressChange() {
      this.setState({addressChangeDialogOpen: true});
    },


    onAllDialogClose() {
      this.setState({
        emailChangeDialogOpen: false,
        passwordChangeDialogOpen: false,
        phoneChangeDialogOpen: false,
        nicknameChangeDialogOpen: false,
        addressChangeDialogOpen: false
      });
    },


    emailSetCallback(newEmail) {
      cookie.user.setEmail(newEmail);
      sessionHelper.dispatchUserAttributeState();
    },


    newPasswordSetCallback() {
      this.setState({passwordDescription: "The password has been successfully changed."});
    },


    phoneSetCallback(newPhone) {
      cookie.user.setPhone(newPhone);
      sessionHelper.dispatchUserAttributeState();
    },


    nicknameSetCallback(newNickname) {
      cookie.user.setNickname(newNickname);
      sessionHelper.dispatchUserAttributeState();
    }
  });


  return UserAccountmanagementMainComponent;
});