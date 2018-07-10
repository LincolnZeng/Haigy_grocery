modulejs.define("component/layout/_top_nav", [
  "alerter",
  "jquery",
  "react",
  "react_redux",
  "material_ui",
  "app/constant",
  "app/navigator",
  "helper/session",
  "component/user/_address_dialog/main",
  "component/user/_sign_in_form",
  "component/user/_sign_up_form",
  "component/layout/_search_dialog"
], function(alerter, $, React, ReactRedux, MaterialUi, constant, navigator,
  sessionHelper, UserAddressdialogMainComponent, UserSigninformComponent,
  UserSignupformComponent, LayoutSearchdialogComponent
) {
  "use strict";


  // ---------- React Component ----------

  const MenuItem = React.createClass({
    render() {
      return (<div className="item" onClick={this.onClick}><a href="#">{this.props.text}</a></div>);
    },


    onClick(event) {
      event.preventDefault();
      event.currentTarget.blur();
      if (this.props.onClick) {
        this.props.onClick(event);
      } else {
        navigator.visit(this.props.url);
      }
    }
  });


  // use dropdown feature from Semantic UI, it's not that well supported by React
  // memory leak happens sometime. It's better to optimize this in the future.
  const DropdownMenu = React.createClass({
    render() {
      return (
        <div className={["ui dropdown ", this.props.className].join("")} ref={(elementRef) => this.dropdownMenu = $(elementRef)}>
          {this.props.children}
        </div>
      );
    },


    componentDidMount() {
      if (this.dropdownMenu) {
        this.dropdownMenu.dropdown({action: "hide"});
      }
    },


    componentDidUpdate() {
      if (this.dropdownMenu) {
        this.dropdownMenu.dropdown("refresh");
      }
    },


    componentWillUnmount() {
      if (this.dropdownMenu) {
        this.dropdownMenu.dropdown("destroy");
      }
    }
  });


  // use popup feature from Semantic UI, it's not that well supported by React
  // memory leak happens sometime. It's better to optimize this in the future.
  const TopNavUserInfo = React.createClass({
    getInitialState() {
      return {showAddressdialog: false};
    },


    render() {
      var userAttributes = this.props.currentState.userAttributes || {};
      var deliveryZipCode = userAttributes.deliveryZipCode || "Unknown";
      var nickname = userAttributes.nickname || "Unknown";
      var address = userAttributes.address;
      var nicknameShort = nickname;
      if (nickname.length > 10) {
        nicknameShort = [nickname.substr(0, 10), "..."].join("");
      }

      var popupAddressInfo = null;
      if (address) {
        popupAddressInfo = (
          <div>
            Your delivery address is
            <i><strong> {address.formattedAddress}</strong></i>
          </div>
        );
      } else {
        popupAddressInfo = <div>Your delivery zip code is <i><strong>{deliveryZipCode}</strong></i></div>;
      }

      return (
        <div id="layout-top-nav-info">
          <span id="layout-top-nav-info-content" ref={(elementRef) => this.elementWithPopup = $(elementRef)}>
            <i className="user icon"></i>
            <a id="layout-top-nav-user-nickname" className="haigy-padding-r-15px" href={navigator.userAccountmanagementHash}>
              {nicknameShort}
            </a>
            <i className="shipping icon"></i>
            <a id="layout-top-nav-zip-code" href="#" onClick={this.openAddressdialog}>
              {deliveryZipCode}
            </a>
          </span>
          <div className="ui popup haigy-width-min-250px">
            <div>Welcome <i><strong>{nickname}</strong></i></div>
            {popupAddressInfo}
          </div>

          <UserAddressdialogMainComponent
            currentState={this.props.currentState}
            open={this.state.showAddressdialog}
            onRequestClose={this.closeAddressdialog}
          />
        </div>
      );
    },


    componentDidMount() {
      if (this.elementWithPopup) {
        this.elementWithPopup.popup({
          inline: true,
          position: "bottom left",
          variation: "very wide",
          delay: {show: 450, hide: 200}
        });
      }
    },


    componentDidUpdate() {
      if (this.elementWithPopup) {
        this.elementWithPopup.popup("refresh");
      }
    },


    componentWillUnmount() {
      if (this.elementWithPopup) {
        this.elementWithPopup.popup("destroy");
      }
    },


    openAddressdialog(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.setState({showAddressdialog: true});
    },


    closeAddressdialog() {
      this.setState({showAddressdialog: false});
    }
  });


  const RawLayoutTopnavComponent = React.createClass({
    getInitialState() {
      return {
        signInDialogOpen: false,
        signUpDialogOpen: false,
        searchDialogOpen: false
      };
    },


    render() {
      var userAttributes = this.props.currentState.userAttributes || {};

      var topNavInfo = null;
      var smallScreenMenus = null;
      var wideScreenMenus = null;
      var wideScreenUserActions = null;
      var signInDialog = null;
      var signUpDialog = null;

      if (userAttributes.userId) {
        topNavInfo = <TopNavUserInfo currentState={this.props.currentState} />;
        var signOutText = userAttributes.isTemporary ? "Leave" : "Sign Out";

        smallScreenMenus = (
          <div className="menu">
            <MenuItem url={navigator.mainFaqHash} text="FAQ" />
            <MenuItem url={navigator.mainHowhaigyworksHash} text="Customized Order" />
            <MenuItem url={navigator.mainContactusHash} text="Contact Us" />
            <div className="divider"></div>
            <MenuItem url={navigator.userAccountmanagementHash} text="My Account" />
            <MenuItem text={signOutText} onClick={this.signOut} />
          </div>
        );

        wideScreenMenus = (
          <div className="menu">
            <MenuItem url={navigator.mainFaqHash} text="FAQ" />
            <MenuItem url={navigator.mainHowhaigyworksHash} text="Customized Order" />
            <MenuItem url={navigator.mainContactusHash} text="Contact Us" />
            <div className="divider"></div>
            <MenuItem url={navigator.userAccountmanagementHash} text="My Account" />
          </div>
        );

        wideScreenUserActions = (
          <span><a href="#" className="haigy-padding-l-15px" onClick={this.signOut}>{signOutText}</a></span>
        );
      } else {
        topNavInfo = (
          <div id="layout-top-nav-info">
            <span id="layout-top-nav-info-content">
              Welcome to Haigy!
            </span>
          </div>
        );

        smallScreenMenus = (
          <div className="menu">
            <MenuItem url={navigator.mainFaqHash} text="FAQ" />
            <MenuItem url={navigator.mainHowhaigyworksHash} text="Customized Order" />
            <MenuItem url={navigator.mainContactusHash} text="Contact Us" />
            <div className="divider"></div>
            <MenuItem onClick={this.openSignInDialog} text="Sign In" />
            <MenuItem onClick={this.openSignUpDialog} text="Sign Up" />
          </div>
        );

        wideScreenMenus = (
          <div className="menu">
            <MenuItem url={navigator.mainFaqHash} text="FAQ" />
            <MenuItem url={navigator.mainHowhaigyworksHash} text="Customized Order" />
            <MenuItem url={navigator.mainContactusHash} text="Contact Us" />
          </div>
        );

        wideScreenUserActions = (
          <span>
            <a href="#" className="haigy-padding-l-15px haigy-padding-r-15px" onClick={this.openSignInDialog}>Sign In</a>
            <a href="#" className="haigy-padding-l-15px" onClick={this.openSignUpDialog}>Sign Up</a>
          </span>
        );

        const Dialog = MaterialUi.Dialog;
        signInDialog = (
          <Dialog
            open={this.state.signInDialogOpen}
            onRequestClose={this.closeSignInDialog}
            autoDetectWindowHeight={false}
            style={constant.materialUi.DIALOG_STYLE}
          >
            <UserSigninformComponent
              formHeader="Sign In"
              justBeforePasswordRecovery={this.closeSignInDialog}
              signInSuccessCallback={this.closeSignInDialog}
              signInErrorCallback={this.closeSignInDialog}
            />
          </Dialog>
        );
        signUpDialog = (
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
        );
      }

      var cartIconButton = null;
      var cartTextLink = null;
      if (this.props.currentComponent.componentName === constant.specialComponentName.CART_SHOW) {
        cartIconButton = (
          <a
            className="circular ui icon button"
            href="#"
            title="Go Back"
            onClick={this.goBack}
          >
            <i className='arrow left icon'></i>
          </a>
        );
        cartTextLink = <a href="#" className="haigy-padding-r-15px" onClick={this.goBack}>Go Back</a>;
      } else {
        cartIconButton = (
          <a
            className="circular ui icon button"
            href={navigator.cartManageHash}
            title="Shopping Cart"
          >
            <i className="shop icon"></i>
          </a>
        );
        cartTextLink = <a href={navigator.cartManageHash} className="haigy-padding-r-15px">Shopping Cart</a>;
      }

      return (
        <div id="layout-top-nav-container">
          <div className="ui container haigy-position-relative">
            {topNavInfo}

            <div id="layout-small-screen-top-nav-buttons" className="haigy-display-only-small-screen">
              {cartIconButton}

              <button id="layout-top-nav-search" className="circular ui icon button" onClick={this.openSearchDialog}>
                <i className="search icon"></i>
              </button>

              <DropdownMenu className="circular ui icon top right pointing button">
                <i className="sidebar icon"></i>
                {smallScreenMenus}
              </DropdownMenu>
            </div>

            <div id="layout-wide-screen-top-menus" className="haigy-display-only-wide-screen">
              {cartTextLink}
              <a href="#" className="haigy-padding-l-15px haigy-padding-r-15px" onClick={this.openSearchDialog}>Search</a>
              <div className="haigy-display-inline-block haigy-padding-l-15px haigy-padding-r-30px">
                <DropdownMenu>
                  <div className="text">More</div>
                  <i className="dropdown icon"></i>
                  {wideScreenMenus}
                </DropdownMenu>
              </div>
              {wideScreenUserActions}
            </div>

            <LayoutSearchdialogComponent
              dialogOpen={this.state.searchDialogOpen}
              onDialogClose={this.closeSearchDialog}
            />

            {signInDialog}
            {signUpDialog}
          </div>
        </div>
      );
    },


    openSignInDialog(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.setState({signInDialogOpen: true});
    },


    closeSignInDialog() {
      this.setState({signInDialogOpen: false});
    },


    openSignUpDialog(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.setState({signUpDialogOpen: true});
    },


    closeSignUpDialog() {
      this.setState({signUpDialogOpen: false});
    },


    openSearchDialog(event) {
      event.preventDefault();
      event.currentTarget.blur();
      this.setState({searchDialogOpen: true});
    },


    closeSearchDialog() {
      this.setState({searchDialogOpen: false});
    },


    signOut(event) {
      event.preventDefault();
      event.currentTarget.blur();
      sessionHelper.signOut();
    },


    goBack: function(event) {
      event.preventDefault();
      event.currentTarget.blur();
      navigator.back();
    }
  });


  // ---------- React Redux Connection ----------

  const mapStateToProps = (state) => {
    return {
      currentComponent: state.currentPageMainComponent,
      currentState: {
        userAttributes: state.userAttributes,
        sessionIsUpToDate: state.sessionIsUpToDate
      }
    };
  };
  const mapDispatchToProps = () => {return {};};


  const LayoutTopnavComponent = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
  )(RawLayoutTopnavComponent);


  return LayoutTopnavComponent;
});