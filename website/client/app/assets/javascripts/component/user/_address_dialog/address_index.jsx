modulejs.define("component/user/_address_dialog/address_index", [
  "react",
  "material_ui",
  "component/user/_address_dialog/address_show"
], function(React, MaterialUi, UserAddressdialogAddressshowComponent) {
  "use strict";


  const UserAddressdialogAddressindexComponent = React.createClass({
    render() {
      const RaisedButton = MaterialUi.RaisedButton;
      var content = null;

      var newAddressButton = (
        <div className="item" key="new">
          <div className="content haigy-text-align-right">
            <RaisedButton label="Add New Address" primary={true} onTouchTap={this.addNewAddress} />
          </div>
        </div>
      );

      if (this.props.addressList.length > 0) {
        var that = this;
        content = (
          <div className="ui divided items">
            {
              that.props.addressList.map(function(address) {
                return (
                  <UserAddressdialogAddressshowComponent
                    key={address.id}
                    address={address}
                    onSelect={that.selectAddress}
                    onEdit={that.editAddress}
                    onDelete={that.deleteAddress}
                  />
                );
              })
            }

            {newAddressButton}
          </div>
        );
      } else {
        content = (
          <div className="ui divided items">
            <div className="item">
              <div className="content haigy-text-align-center">
                No address is found.
              </div>
            </div>

            {newAddressButton}
          </div>
        );
      }

      return (
        <div>
          <h3>All Addresses</h3>
          {content}
        </div>
      );
    },


    selectAddress(address) {
      this.props.selectAddress(address);
    },


    addNewAddress(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.props.addNewAddress();
    },


    editAddress(address) {
      this.props.editAddress(address);
    },


    deleteAddress(address) {
      this.props.deleteAddress(address);
    }
  });


  return UserAddressdialogAddressindexComponent;
});