modulejs.define("component/main/_loading", [
  "react",
  "material_ui"
], function(React, MaterialUi) {
  "use strict";


  var MainLoadingComponent = React.createClass({
    propTypes: {
      loadingMessage: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ])
    },


    getDefaultProps: function() {
      return {
        loadingMessage: "Loading ..."
      };
    },


    render() {
      const CircularProgress = MaterialUi.CircularProgress;

      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <br /><br /><CircularProgress size={0.8} /><br /><i>{this.props.loadingMessage}</i>
        </div>
      );
    }
  });


  return MainLoadingComponent;
});