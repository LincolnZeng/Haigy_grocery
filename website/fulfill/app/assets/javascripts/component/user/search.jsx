modulejs.define("component/user/search", [
  "alerter",
  "confirmer",
  "react",
  "material_ui",
  "lib/validator",
  "app/constant",
  "app/utility",
  "app/cookie",
  "app/cached_request",
  "app/navigator",
  "helper/cart",
  "model/user",
  "model/user_binded_account",
  "collection/user/search",
  "collection/cart_entry/index",
  "component/main/_loading"
], function(alerter, confirmer, React, MaterialUi, validator, constant,
  utility, cookie, cachedRequest, navigator, cartHelper, userModel,
  userbindedaccountModel, userSearchCollection, cartentryIndexCollection,
  MainLoadingComponent
) {
  "use strict";


  const idPhoneNumber = constant.user.BINDED_ACCOUNT_TYPE.phone.id.toString();
  const stringPhoneNumber = constant.user.BINDED_ACCOUNT_TYPE.phone.name;

  const idEmailAddress = constant.user.BINDED_ACCOUNT_TYPE.email.id.toString();
  const stringEmailAddress = constant.user.BINDED_ACCOUNT_TYPE.email.name;

  const idFacebookMessagerAccount = constant.user.BINDED_ACCOUNT_TYPE.facebookMessager.id.toString();
  const stringFacebookMessagerAccount = constant.user.BINDED_ACCOUNT_TYPE.facebookMessager.name;

  const accountTypeIdToStringMap = {};
  accountTypeIdToStringMap[idPhoneNumber] = stringPhoneNumber;
  accountTypeIdToStringMap[idEmailAddress] = stringEmailAddress;
  accountTypeIdToStringMap[idFacebookMessagerAccount] = stringFacebookMessagerAccount;

  const accountTypeStringToIdMap = {};
  accountTypeStringToIdMap[stringPhoneNumber] = idPhoneNumber;
  accountTypeStringToIdMap[stringEmailAddress] = idEmailAddress;
  accountTypeStringToIdMap[stringFacebookMessagerAccount] = idFacebookMessagerAccount;


  var UserSearchComponent = React.createClass({
    getInitialState: function() {
      return {
        accountType: stringPhoneNumber,
        accountLabel: stringPhoneNumber,
        account: "",
        accountError: "",
        zipCode: "",
        zipCodeError: "",
        isNewUserForm: false,
        submitLoading: false,
        hasFoundUsers: false,
        foundUserList: [],
        selectUserLoading: false
      };
    },


    render: function() {
      const SelectField = MaterialUi.SelectField;
      const MenuItem = MaterialUi.MenuItem;
      const RaisedButton = MaterialUi.RaisedButton;
      const TextField = MaterialUi.TextField;
      const CircularProgress = MaterialUi.CircularProgress;

      var content = null;

      if (this.state.hasFoundUsers === true) {
        if (this.state.selectUserLoading === true) {
          content = <MainLoadingComponent loadingMessage="Selecting User ..." />;
        } else {
          var that = this;
          var userListDisplay = this.state.foundUserList.map(function(user) {
            var userBindedAccounts = user.get("user_binded_accounts").map(function(bindedAccount) {
              return (
                <div key={bindedAccount.account_id} className="meta">
                  {accountTypeIdToStringMap[(bindedAccount.account_type || "").toString()]}: {bindedAccount.account}
                </div>
              );
            });
            return (
              <div key={user.id} className="item">
                <div className="content">
                  <div className="header">Nickname: {user.get("nickname")}</div>
                  <div className="meta">{user.get("is_temporary") === true ? "Guest User" : "Registered User"}</div>
                  <div className="meta">Zip Code: {user.get("deflaut_zip_code")}</div>
                  {userBindedAccounts}
                  <div className="extra">
                    <RaisedButton label="Select this User" primary={true} onTouchTap={function() {that.selectUser(user.id);}} />
                  </div>
                </div>
              </div>
            );
          });
          content = (
            <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-600px haigy-text-align-left">
              <div><a href="#" onClick={this.backToSearch}>Back to Search</a></div>
              <h2>Found Users</h2>
              <br />
              <div className="haigy-padding-l-30px">
                <div className="ui divided items">{userListDisplay}</div>
              </div>
            </div>
          );
        }
      } else {
        var isNewUserForm = this.state.isNewUserForm === true;

        var accountInputField = (
          <div>
            <TextField
              floatingLabelText={this.state.accountLabel} type="text" fullWidth={true}
              value={this.state.account} onChange={this.onAccountChange}
              errorText={this.state.accountError}
            />
          </div>
        );

        var submitButton = null;
        var toggleButton = null;
        if (this.state.submitLoading === true) {
          submitButton = (<div className="haigy-text-align-center"><CircularProgress size={0.5} /><br /><span>...</span></div>);
        } else {
          var submitButtonText = isNewUserForm ? "Create" : "Search";
          submitButton = (<RaisedButton className="haigy-width-100-percent" label={submitButtonText} type="submit" primary={!isNewUserForm} secondary={isNewUserForm} />);

          var toggleButtonText = isNewUserForm ? "Search User" : "New User";
          toggleButton =  (
            <div>
              <br /><div className="ui horizontal divider">OR</div><br />
              <form onSubmit={this.onToggleButton}>
                <RaisedButton className="haigy-width-100-percent" label={toggleButtonText} type="submit" primary={isNewUserForm} secondary={!isNewUserForm} />
              </form>
            </div>
          );
        }

        var formHeader = null;
        var form = null;
        if (isNewUserForm) {
          formHeader = "Create User Account";

          form = (
            <form onSubmit={this.createUser}>
              {accountInputField}

              <div>
                <TextField
                  floatingLabelText="Delivery Zip Code" type="text" fullWidth={true}
                  value={this.state.zipCode} onChange={this.onZipCodeChange}
                  errorText={this.state.zipCodeError}
                />
              </div>

              <br />
              {submitButton}
            </form>
          );
        } else {
          formHeader = "Search User";

          form = (
            <form onSubmit={this.searchUser}>
              {accountInputField}
              <br />
              {submitButton}
            </form>
          );
        }

        content = (
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-300px haigy-text-align-left">
            <br />
            <h2>{formHeader}</h2>

            <div>
              <SelectField fullWidth={true} value={this.state.accountType} onChange={this.onAccountTypeChange}>
                <MenuItem value={stringPhoneNumber} primaryText={stringPhoneNumber} />
                <MenuItem value={stringFacebookMessagerAccount} primaryText={stringFacebookMessagerAccount} />
                <MenuItem value={stringEmailAddress} primaryText={stringEmailAddress} />
              </SelectField>
            </div>

            {form}

            {toggleButton}
          </div>
        );
      }

      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          {content}
        </div>
      );
    },


    onAccountTypeChange: function(event, index, value) {
      this.setState({accountType: value, accountLabel: value, accountError: ""});
    },


    onAccountChange: function(event) {
      var value = event.currentTarget.value;
      if (this.state.accountType === stringPhoneNumber) {
        value = utility.lib.formattedUsPhoneNumber(value);
      }
      this.setState({account: value, accountError: ""});
    },


    onZipCodeChange: function(event) {
      this.setState({zipCode: event.currentTarget.value, zipCodeError: ""});
    },


    validateAccountInput: function() {
      var that = this;

      var inputValid = false;
      var account = this.state.account;
      switch (this.state.accountType) {
      case stringPhoneNumber:
        inputValid = validator.usPhone(account, function(invalidMessage) {
          that.setState({accountError: invalidMessage});
        });
        break;
      case stringEmailAddress:
        inputValid = validator.email(account, function(invalidMessage) {
          that.setState({accountError: invalidMessage});
        });
        break;
      case stringFacebookMessagerAccount:
        inputValid = validator.facebookMessager(account, function(invalidMessage) {
          that.setState({accountError: invalidMessage});
        });
        break;
      default:
        inputValid = false;
        that.setState({accountError: "Unknown error."});
      }
      return inputValid;
    },


    onToggleButton: function(event) {
      event.preventDefault();
      this.setState({isNewUserForm: !this.state.isNewUserForm});
    },


    selectUser: function(userId) {
      var that = this;
      that.setState({selectUserLoading: true});

      cachedRequest.fetchModel(userModel, userId, {
        success: function(selectedUser) {
          that.onUserSelected(selectedUser.attributes);
        },

        error: function(collection, jqXHR) {
          if (jqXHR && jqXHR.responseJSON) {
            if (jqXHR.responseJSON.error_code === constant.errorCode.INVALID_TOKEN) {
              navigator.refresh();
            } else {
              alerter(jqXHR.responseJSON.error_message);
            }
          } else {
            alerter(constant.text.UNKNOWN_ERROR);
          }
          that.setState({selectUserLoading: false});
        }
      });
    },


    onUserSelected: function(userAttributes) {
      cookie.clearAllUserRelatedCookie();
      cookie.user.setUserId(userAttributes.id);
      cookie.user.setZipCode(userAttributes.default_zip_code);
      cookie.user.setNickname(userAttributes.nickname);
      var cart = userAttributes.cart;

      var cartEntryCollection = new cartentryIndexCollection(cart.cart_entry, {cartId: cart.cart_id});
      cartHelper.parseServerResponse(cartEntryCollection);

      navigator.cartManage();
    },


    searchUser: function(event) {
      event.preventDefault();

      if (this.state.submitLoading !== true) {
        if (this.validateAccountInput()) {
          var that = this;
          that.setState({submitLoading: true});

          cachedRequest.fetchCollection(userSearchCollection, {}, {
            type: "POST",

            data: {
              account_type: accountTypeStringToIdMap[that.state.accountType],
              account: that.state.account.trim()
            },

            success: function(collection) {
              that.setState({submitLoading: false, hasFoundUsers: true, foundUserList: collection.models, selectUserLoading: false});
            },

            error: function(collection, jqXHR) {
              if (jqXHR && jqXHR.responseJSON) {
                if (jqXHR.responseJSON.error_code === constant.errorCode.INVALID_TOKEN) {
                  navigator.refresh();
                } else {
                  alerter(jqXHR.responseJSON.error_message);
                }
              } else {
                alerter(constant.text.UNKNOWN_ERROR);
              }
              that.setState({submitLoading: false});
            }
          });
        } else {
          this.setState({accountError: [this.state.accountType, " is not valid."].join("")});
        }
      }
    },


    createUser: function(event) {
      event.preventDefault();
      if (this.state.submitLoading !== true) {
        var that = this;

        var accountValid = this.validateAccountInput();
        var zipCodeValid = validator.usZipCode(this.state.zipCode, function(invalidMessage) {
          that.setState({zipCodeError: invalidMessage});
        });

        if (accountValid && zipCodeValid) {
          var accountType = that.state.accountType;
          var account = that.state.account.trim();
          var zipCode = that.state.zipCode.trim();

          var confirmMessage = (
            <div>
              <div>Create a new account for user:</div>
              <br />
              <div>{accountType}: {account}</div>
              <div>Zip Code: {zipCode}</div>
              <br />
              <div>Correct?</div>
            </div>
          );

          confirmer(confirmMessage, function() {
            that.setState({submitLoading: true});
            var accountTypeId = accountTypeStringToIdMap[accountType];

            cachedRequest.saveModel(userbindedaccountModel, {
              account_type: accountTypeId,
              account: account,
              zip_code: zipCode
            }, {
              success: function(newUserBindedAccount) {
                that.setState({submitLoading: false});
                that.onUserSelected(newUserBindedAccount.get("user"));
              },

              error: function(model, jqXHR) {
                if (jqXHR && jqXHR.responseJSON) {
                  if (jqXHR.responseJSON.error_code === constant.errorCode.INVALID_TOKEN) {
                    navigator.refresh();
                  } else {
                    alerter(jqXHR.responseJSON.error_message);
                  }
                } else {
                  alerter(constant.text.UNKNOWN_ERROR);
                }
                that.setState({submitLoading: false});
              }
            });
          }, null, "Yes", "No").open();
        }
      }
    },


    backToSearch(event) {
      event.preventDefault();
      this.setState({hasFoundUsers: false, foundUserList: [], selectUserLoading: false});
    }
  });


  return UserSearchComponent;
});