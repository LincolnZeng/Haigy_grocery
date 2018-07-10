modulejs.define("component/cart/manage", [
  "react",
  "helper/cart",
  "app/constant",
  "component/main/_loading",
  "component/cart/show/main"
], function(React, cartHelper, constant, MainLoadingComponent, CartShowMainComponent) {
  "use strict";


  // this is a wrapper for "CartShowMainComponent" to automatically get the cart id
  var CartManageComponent = React.createClass({
    statics: {
      componentName: constant.specialComponentName.CART_SHOW
    },


    propTypes: {
      currentState: React.PropTypes.shape({
        sessionIsUpToDate: React.PropTypes.bool.isRequired
      })
    },


    getInitialState() {
      return {
        loading: true,
        cartId: null
      };
    },


    render() {
      var content = null;
      if (this.state.loading) {
        content = <MainLoadingComponent />;
      } else {
        content = <CartShowMainComponent
          options={{id: this.state.cartId}}
          currentState={{sessionIsUpToDate: this.props.currentState.sessionIsUpToDate}}
          getCurrentCartIfCheckedOut={true}
        />;
      }

      return content;
    },


    getData(props) {
      if (props.currentState.sessionIsUpToDate) {
        this.setState({loading: false, cartId: cartHelper.getCartIdFromCookie()});
      } else {
        this.setState({loading: true});
      }
    },


    componentWillMount() {
      this.getData(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getData(nextProps);
    }
  });


  return CartManageComponent;
});