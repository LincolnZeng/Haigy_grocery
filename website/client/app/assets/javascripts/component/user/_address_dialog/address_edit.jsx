modulejs.define("component/user/_address_dialog/address_edit", [
  "underscore",
  "react",
  "material_ui",
  "lib/validator"
], function(_, React, MaterialUi, validator) {
  "use strict";


  var UserAddressdialogAddresseditComponent = React.createClass({
    getInitialState() {
      return {
        addressId: null,
        isBusinessAddress: false,
        businessName: "",
        businessNameError: "",
        address: "",
        addressError: "",
        note: "",
        noteError: ""
      };
    },


    render() {
      const Checkbox = MaterialUi.Checkbox;
      const RaisedButton = MaterialUi.RaisedButton;
      const TextField = MaterialUi.TextField;

      var businessNameField = null;
      if (this.state.isBusinessAddress) {
        businessNameField = (
          <div>
            <TextField
              floatingLabelText="Business Name" type="text" fullWidth={true}
              value={this.state.businessName} onChange={this.onBusinessNameChange}
              errorText={this.state.businessNameError}
            />
          </div>
        );
      }

      return (
        <div>
          <h3>{this.state.zipCode ? "Edit Address" : "New Address"}</h3>
          <div className="haigy-width-100-percent haigy-text-align-center">
            <form onSubmit={this.onSave} className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-500px haigy-text-align-left">
              <div className="haigy-padding-t-15px">
                <Checkbox
                  label="Business Address"
                  checked={this.state.isBusinessAddress}
                  onClick={this.toggleBusinessAddress}
                />
              </div>

              {businessNameField}

              <div>
                <TextField
                  hintText="Street Address, Zip Code"
                  floatingLabelText={<span>Address <span className="haigy-font-color-red">*</span></span>}
                  type="text" fullWidth={true} value={this.state.address}
                  onChange={this.onAddressChange} errorText={this.state.addressError}
                  multiLine={true} rows={1}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText="Note" type="text" fullWidth={true}
                  value={this.state.note} onChange={this.onNoteChange}
                  errorText={this.state.noteError}
                />
              </div>

              <br />

              <div>
                <div className="haigy-text-align-right haigy-display-only-wide-screen">
                  <span>
                    <RaisedButton label="Cancel" secondary={true} onTouchTap={this.onCancel} />
                  </span>
                  <span className="haigy-padding-l-20px">
                    <RaisedButton type="submit" className="haigy-width-min-200px" label="Save" primary={true} onTouchTap={this.onSave} />
                  </span>
                </div>

                <div className="haigy-display-only-small-screen">
                  <div className="haigy-padding-t-10px haigy-padding-b-10px">
                    <RaisedButton type="submit" className="haigy-width-100-percent" label="Save" primary={true} onTouchTap={this.onSave} />
                  </div>
                  <div>
                    <RaisedButton className="haigy-width-100-percent" label="Cancel" secondary={true} onTouchTap={this.onCancel} />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    },


    componentWillMount() {
      if (this.props.address) {
        this.setState(this.props.address);
      }
    },


    componentWillReceiveProps(nextProps) {
      this.backupNewAddressInput();
      if (nextProps.address) {
        this.setState(this.getInitialState());
        this.setState(nextProps.address);
      }
    },


    componentWillUnmount() {
      this.backupNewAddressInput();
    },


    backupNewAddressInput() {
      if (!this.state.addressId) {
        if (this.props.backupNewAddressInput) {
          this.props.backupNewAddressInput({
            isBusinessAddress: this.state.isBusinessAddress,
            businessName: this.state.businessName,
            address: this.state.address,
            note: this.state.note
          });
        }
      }
    },


    toggleBusinessAddress() {
      this.setState({isBusinessAddress: !this.state.isBusinessAddress, businessNameError: ""});
    },


    onBusinessNameChange(event) {
      this.setState({businessName: event.currentTarget.value, businessNameError: ""});
    },


    onAddressChange(event) {
      this.setState({address: event.currentTarget.value, addressError: ""});
    },


    onNoteChange(event) {
      this.setState({note: event.currentTarget.value, noteError: ""});
    },


    onCancel(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.props.onCancel(event);
    },


    onSave(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.validateAndSaveAddress(this);
    },


    // use _.throttle to prevent submit multiple times
    // usage: this.validateAndSaveAddress(this);
    validateAndSaveAddress: _.throttle(function(context) {
      var allInputValid = true;
      var inputMaxLength = 250;

      var address = (context.state.address || "").trim();
      allInputValid = validator.minLength(address, 1, false, function() {
        context.setState({addressError: "Address is required."});
      }) && allInputValid;

      var businessName = (context.state.businessName || "").trim();
      allInputValid = validator.maxLength(businessName, inputMaxLength, false, function() {
        context.setState({businessNameError: ["Business name should be at most ", inputMaxLength," characters."].join("")});
      }) && allInputValid;

      var note = (context.state.note || "").trim();
      allInputValid = validator.maxLength(note, inputMaxLength, false, function() {
        context.setState({noteError: ["Note should be at most ", inputMaxLength," characters."].join("")});
      }) && allInputValid;

      if (allInputValid) {
        var addressAttributeObject = {
          addressId: context.state.addressId,
          isBusinessAddress: context.state.isBusinessAddress,
          businessName: businessName,
          address: address,
          note: note
        };

        context.props.onSave(addressAttributeObject);
      }
    }, 500, {trailing: false})
  });


  return UserAddressdialogAddresseditComponent;
});