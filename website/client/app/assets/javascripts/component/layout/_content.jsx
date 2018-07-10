modulejs.define("component/layout/_content", [
  "react",
  "react_redux"
], function(React, ReactRedux) {
  "use strict";


  // ---------- React Component ----------

  const RawLayoutContentComponent = React.createClass({
    render() {
      const CurrentComponent = this.props.currentComponent;

      return (
        <div id="layout-content" className="ui container layout-container haigy-padding-b-100px">
          <CurrentComponent
            options={this.props.options}
            currentState={this.props.currentState}
          />
        </div>
      );
    }
  });


  // ---------- React Redux Connection ----------

  const mapStateToProps = (state) => {
    return {
      currentComponent: state.currentPageMainComponent,
      options: state.currentPageOptions,
      currentState: {
        userAttributes: state.userAttributes,
        sessionIsUpToDate: state.sessionIsUpToDate
      }
    };
  };


  const mapDispatchToProps = () => {return {};};


  const LayoutContentComponent = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
  )(RawLayoutContentComponent);


  return LayoutContentComponent;
});