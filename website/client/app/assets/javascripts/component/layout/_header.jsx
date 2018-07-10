modulejs.define("component/layout/_header", [
  "alerter",
  "react",
  "react_redux",
  "app/constant",
  "app/analytics",
  "app/navigator"
], function(alerter, React, ReactRedux, constant, analytics, navigator) {
  "use strict";


  // ---------- React Component ----------

  const RawLayoutHeaderComponent = React.createClass({
    getInitialState() {
      return {
        searchKeyword: ""
      };
    },


    render() {
      var cartIconButton = null;
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
      }

      return (
        <div id="layout-header-container" className="ui container layout-container">
          <div className="haigy-display-only-wide-screen haigy-padding-t-30px"><div className="haigy-position-relative">
            <h1 className="ui header"><a href={navigator.mainHomeHash}><span className="haigy-font-color-purple">Haigy</span> <span className="haigy-font-color-gray">Grocery‎ Delivery</span></a></h1>
            <div id="layout-wide-screen-slogan"><i><small>Only $2.99 per delivery | Next day delivery | Laid-back and eat healthy</small></i></div>

            <div id="layout-wide-screen-search" className="haigy-text-align-right">
              <div className="haigy-display-inline-block">
                {cartIconButton}
              </div>

              <div className="haigy-display-inline-block haigy-padding-l-30px">
                <form className="ui icon input" onSubmit={this.onSearchSubmit}>
                  <input id="layout-search-input" type="text" placeholder="Search ..." value={this.state.searchKeyword} onChange={this.onSearchKeywordChange} />
                  <i id="layout-search-input-start-search" className="search link icon" onClick={this.onSearchSubmit}></i>
                </form>
              </div>
            </div>
          </div></div>

          <div className="haigy-display-only-small-screen haigy-padding-t-25px">
            <h2 className="ui header haigy-text-align-center">
              <a href={navigator.mainHomeHash}><span className="haigy-font-color-purple">Haigy</span> <span className="haigy-font-color-gray">Grocery‎ Delivery</span></a>
            </h2>
            <div id="layout-small-screen-slogan" className="haigy-text-align-center"><i><small><small>Only $2.99 per delivery | Next day delivery | Laid-back and eat healthy</small></small></i></div>
          </div>
        </div>
      );
    },


    onSearchKeywordChange(event) {
      this.setState({searchKeyword: event.currentTarget.value});
    },


    onSearchSubmit(event) {
      event.preventDefault();
      event.currentTarget.blur();
      var searchKeyword = (this.state.searchKeyword || "").toString();
      if (searchKeyword.length > 0) {
        analytics.itemSearched(searchKeyword);
        navigator.briefinfoitemSearch(searchKeyword);
      }
    },


    goBack(event) {
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


  const LayoutHeaderComponent = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
  )(RawLayoutHeaderComponent);


  return LayoutHeaderComponent;
});