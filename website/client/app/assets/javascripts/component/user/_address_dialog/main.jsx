modulejs.define("component/user/_address_dialog/main", [
  "logger",
  "confirmer",
  "react",
  "material_ui",
  "app/constant",
  "app/utility",
  "app/cache",
  "app/cookie",
  "app/navigator",
  "app/error_handler",
  "app/cached_request",
  "helper/session",
  "model/user_address",
  "collection/user_address/index",
  "collection/user_address/select_address",
  "component/main/_loading",
  "component/user/_address_dialog/address_index",
  "component/user/_address_dialog/address_edit"
], function(logger, confirmer, React, MaterialUi, constant, utility, cache,
  cookie, navigator, errorHandler, cachedRequest, sessionHelper, useraddressModel,
  useraddressIndexCollection, useraddressSelectAddressCollection,
  MainLoadingComponent, UserAddressdialogAddressindexComponent,
  UserAddressdialogAddresseditComponent
) {
  "use strict";


  const CONTENT_LOADING = 0;
  const CONTENT_ADDRESS_INDEX = 1;
  const CONTENT_ADDRESS_EDIT = 2;
  const LOADING_MESSAGE_DEFAULT = "Loading ...";
  const LOADING_MESSAGE_FETCH_ALL = "Loading all addresses ...";
  const LOADING_MESSAGE_FETCH_ONE = "Loading the address ...";
  const LOADING_MESSAGE_SAVE = "Saving the address ...";
  const LOADING_MESSAGE_DELETE = "Deleting the address ...";
  const LOADING_MESSAGE_SELECT = "Changing the address ...";


  var UserAddressdialogMainComponent = React.createClass({
    propTypes: {
      currentState: React.PropTypes.shape({
        userAttributes: React.PropTypes.shape({
          userId: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
          ]),
          isTemporary: React.PropTypes.bool,
          address: React.PropTypes.object
        }).isRequired,
        sessionIsUpToDate: React.PropTypes.bool.isRequired
      }).isRequired,

      open: React.PropTypes.bool,
      onRequestClose: React.PropTypes.func,
      closeAfterAddressSelected: React.PropTypes.bool
    },


    getDefaultProps: function() {
      return {
        open: false,
        onRequestClose: function() {},
        closeAfterAddressSelected: false
      };
    },


    getInitialState() {
      return {
        saving: false,
        currentContent: CONTENT_LOADING,
        loadingMessage: LOADING_MESSAGE_FETCH_ALL,
        addressList: [],
        editedAddress: null
      };
    },


    render() {
      const Dialog = MaterialUi.Dialog;

      var content = null;

      switch (this.state.currentContent) {
      case CONTENT_LOADING:
        content = (
          <div>
            <MainLoadingComponent loadingMessage={this.state.loadingMessage} />
            <br />
          </div>
        );
        break;
      case CONTENT_ADDRESS_INDEX:
        content = (
          <UserAddressdialogAddressindexComponent
            addressList={this.state.addressList}
            selectAddress={this.selectAddress}
            addNewAddress={this.addNewAddress}
            editAddress={this.editAddress}
            deleteAddress={this.deleteAddress}
          />
        );
        break;
      case CONTENT_ADDRESS_EDIT:
        content = (
          <UserAddressdialogAddresseditComponent
            address={this.state.editedAddress}
            onSave={this.saveAddress}
            onCancel={this.onCancelAddressEditForm}
            backupNewAddressInput={this.backupNewAddressInputInCache}
          />
        );
        break;
      default:
        var errorMessage = "Unknown content.";
        logger(errorMessage);
        errorHandler(null, errorMessage);
      }

      return (
        <Dialog
          modal={this.state.saving}
          open={this.props.open}
          onRequestClose={this.props.onRequestClose}
          autoDetectWindowHeight={false}
          style={constant.materialUi.DIALOG_STYLE}
        >
          {content}
        </Dialog>
      );
    },


    initializeData(props) {
      if (props.open) {   // Lazy data fetching
        if (props.currentState.sessionIsUpToDate) {
          var userAttributes = props.currentState.userAttributes;
          if (this.canSaveAddress()) {
            this.showCurrentUserAddressList();
          } else {
            this.editAddress(userAttributes.address);
          }
        } else {
          this.setState({currentContent: CONTENT_LOADING, loadingMessage: LOADING_MESSAGE_DEFAULT});
        }
      }
    },


    componentWillMount() {
      this.initializeData(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.initializeData(nextProps);
    },


    canSaveAddress() {
      return !(this.props.currentState.userAttributes.isTemporary || cookie.user.isGuest());
    },


    showCurrentUserAddressList() {
      this.showAddressList(this.props.currentState.userAttributes.userId);
    },


    showAddressList(userId) {
      var that = this;
      that.setState({currentContent: CONTENT_LOADING, loadingMessage: LOADING_MESSAGE_FETCH_ALL});

      cachedRequest.fetchCollection(useraddressIndexCollection, {userId: userId}, {
        success: function(fetchedUserAddressCollection) {
          that.setState({
            currentContent: CONTENT_ADDRESS_INDEX,
            addressList: fetchedUserAddressCollection.models
          });
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
        }
      });
    },


    selectAddress(address) {
      if (address.getNormalizedAddress().setAsDefault === true) {
        if (this.props.closeAfterAddressSelected) {
          this.props.onRequestClose();
        }
      } else {
        var that = this;
        that.setState({currentContent: CONTENT_LOADING, loadingMessage: LOADING_MESSAGE_SELECT});

        cachedRequest.fetchCollection(useraddressSelectAddressCollection, {}, {
          type: "POST",

          data: {
            id: address.id
          },

          success: function(fetchedSelectaddressCollection) {
            var selectedAddress = fetchedSelectaddressCollection.getSelectedAddress();
            useraddressIndexCollection.resetDefaultUserAddressInCache(selectedAddress.id, selectedAddress.user_id);
            sessionHelper.updateAddress(
              selectedAddress,
              fetchedSelectaddressCollection.getShoppingZipCode()
            );

            if (that.props.closeAfterAddressSelected) {
              that.props.onRequestClose();
            } else {
              that.showCurrentUserAddressList();
            }
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
          }
        }, true);
      }
    },


    onCancelAddressEditForm() {
      if (this.canSaveAddress()) {
        this.showCurrentUserAddressList();
      } else {
        this.props.onRequestClose();
      }
    },


    addNewAddress() {
      var cachedNewAddressInput = cache.userNewAddressInputData.get();
      this.setState({currentContent: CONTENT_ADDRESS_EDIT, editedAddress: cachedNewAddressInput});
    },


    backupNewAddressInputInCache(newAddressInputs) {
      cache.userNewAddressInputData.set(newAddressInputs);
    },


    editAddress(address) {
      if (this.canSaveAddress()) {
        var that = this;
        that.setState({currentContent: CONTENT_LOADING, loadingMessage: LOADING_MESSAGE_FETCH_ONE});

        cachedRequest.fetchModel(useraddressModel, address.id, {
          success: function(fetchedAddress) {
            var normalizedAddress = utility.getNormalizedAddressAttributeObject(fetchedAddress.attributes);
            that.setState({
              currentContent: CONTENT_ADDRESS_EDIT,
              editedAddress: {
                addressId: normalizedAddress.id,
                isBusinessAddress: normalizedAddress.isBusinessAddress,
                businessName: normalizedAddress.businessName,
                address: normalizedAddress.formattedAddress,
                note: normalizedAddress.note
              }
            });
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
          }
        });
      } else {
        if (address) {
          this.setState({
            currentContent: CONTENT_ADDRESS_EDIT,
            editedAddress: {
              isBusinessAddress: address.isBusinessAddress,
              businessName: address.businessName,
              address: address.formattedAddress,
              note: address.note
            }
          });
        } else {
          this.addNewAddress();
        }
      }
    },


    saveAddress(addressAttributeObject) {
      var that = this;
      that.setState({currentContent: CONTENT_LOADING, loadingMessage: LOADING_MESSAGE_SAVE, saving: true});

      var addressData = {
        id: addressAttributeObject.addressId,
        only_validate: false,
        user_id: this.props.currentState.userAttributes.userId,
        is_business_address: addressAttributeObject.isBusinessAddress,
        business_name: (addressAttributeObject.isBusinessAddress ? addressAttributeObject.businessName : ""),
        input_address: addressAttributeObject.address,
        note: addressAttributeObject.note
      };

      var isNewAddress = !addressData.id;
      var canSaveAddress = this.canSaveAddress();
      if (!canSaveAddress) {
        addressData.only_validate = true;
      }

      cachedRequest.saveModel(useraddressModel, addressData, {
        success: function(savedAddress) {
          if (isNewAddress) {
            cache.userNewAddressInputData.clear();
          }
          if (canSaveAddress) {
            that.showCurrentUserAddressList();
          } else {
            that.props.onRequestClose();
          }
          if (!canSaveAddress || savedAddress.get("set_as_default") === true) {
            sessionHelper.updateAddress(savedAddress.attributes, savedAddress.get("shopping_zip_code"));
          }
          that.setState({saving: false});
        },

        error: function(model, jqXHR) {
          that.setState({currentContent: CONTENT_ADDRESS_EDIT, editedAddress: addressAttributeObject, saving: false});
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
        }
      });
    },


    deleteAddress(address) {
      var that = this;

      confirmer("Are you sure to delete this address?", function() {
        that.setState({currentContent: CONTENT_LOADING, loadingMessage: LOADING_MESSAGE_DELETE});

        cachedRequest.destroyModel(useraddressModel, address.id, {
          success: function(deletedAdress) {
            if (deletedAdress.get("set_as_default") === true) {
              sessionHelper.updateAddress({});
            }
            that.showCurrentUserAddressList();
          },

          error: function(model, jqXHR) {
            logger(jqXHR);
            errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
          }
        });
      }, function() {
        that.showCurrentUserAddressList();
      }).open();
    }
  });


  return UserAddressdialogMainComponent;
});