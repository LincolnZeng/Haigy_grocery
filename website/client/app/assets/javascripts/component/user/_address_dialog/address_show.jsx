modulejs.define("component/user/_address_dialog/address_show", [
  "react"
], function(React) {
  "use strict";


  const UserAddressdialogAddressshowComponent = React.createClass({
    render() {
      var address = this.props.address;
      if (address) {
        var normalizedAddress = address.getNormalizedAddress();
        var zipCode = (normalizedAddress.zipCode || "").toString();

        var isBusinessAddress = normalizedAddress.isBusinessAddress === true;
        var addressIconType = null;
        var businessNamePart = null;
        if (isBusinessAddress) {
          addressIconType = "building outline";
          businessNamePart = <div>{normalizedAddress.businessName}</div>;
        } else {
          addressIconType = "home";
        }

        var addressIconColor = null;
        var addressFontClass = null;
        var defaultAddressMark = null;
        if (normalizedAddress.setAsDefault === true) {
          addressIconColor = "green";
          addressFontClass = "haigy-font-bold haigy-font-italic";
          defaultAddressMark = (
            <span className="haigy-padding-r-30px">
              <button className="circular ui icon green button" title="Current delivery address">
                <i className="large checkmark icon"></i>
              </button>
            </span>
          );
        } else {
          addressIconColor = "teal";
          addressFontClass = "";
        }

        var addressNotePart = null;
        var addressNote = normalizedAddress.note;
        if (addressNote && addressNote.trim().length > 0) {
          addressNotePart = <div className="haigy-font-italic"><br />Note: {addressNote}</div>;
        }

        return (
          <div className="item haigy-hover-gray" onClick={this.onSelect}>
            <div className="content">
              <div className="ui stackable grid">
                <div className="ten wide column">

                  <div className="ui grid">
                    <div className="five wide column" title="Click to select this address">
                      <i className={["big", addressIconColor, addressIconType, "icon"].join(" ")}></i>
                    </div>

                    <div className={["eleven wide column", addressFontClass].join(" ")} title="Click to select this address">
                      {businessNamePart}

                      <div>{normalizedAddress.streetAddress}</div>
                      <div>{normalizedAddress.city}, {normalizedAddress.state} {zipCode}</div>

                      {addressNotePart}
                    </div>
                  </div>

                </div>

                <div className="six wide right aligned column">
                  {defaultAddressMark}

                  <button className="circular ui icon button" onClick={this.onDelete} title="Delete">
                    <i className="trash icon"></i>
                  </button>
                  <button className="circular ui icon button" onClick={this.onEdit} title="Edit">
                    <i className="edit icon"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return null;
      }
    },


    onSelect(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.props.onSelect(this.props.address);
    },


    onEdit(event) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.blur();
      this.props.onEdit(this.props.address);
    },


    onDelete(event) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.blur();
      this.props.onDelete(this.props.address);
    }
  });


  return UserAddressdialogAddressshowComponent;
});