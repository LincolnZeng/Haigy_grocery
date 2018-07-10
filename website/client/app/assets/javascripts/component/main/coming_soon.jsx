modulejs.define("component/main/coming_soon", [
  "react",
  "app/navigator"
], function(React, navigator) {
  "use strict";


  var MainComingsoonComponent = React.createClass({
    render() {
      return (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <br /><br />
          <div><i>This feature is coming soon! Thanks for your patience.</i></div>
          <br /><br />
          <div><a href={navigator.mainHomeHash}><i>Back to the Home Page</i></a></div>
        </div>
      );
    }
  });


  return MainComingsoonComponent;
});