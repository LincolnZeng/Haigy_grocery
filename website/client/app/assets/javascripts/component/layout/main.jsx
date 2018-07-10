modulejs.define("component/layout/main", [
  "react",
  "react_redux",
  "material_ui",
  "app/cookie",
  "app/navigator",
  "state/store",
  "component/layout/_top_nav",
  "component/layout/_header",
  "component/layout/_content"
], function(React, ReactRedux, MaterialUi, cookie, navigator, stateStore,
  LayoutTopnavComponent, LayoutHeaderComponent, LayoutContentComponent
) {
  "use strict";


  var LayoutMainComponent = React.createClass({
    render() {
      const MuiThemeProvider = MaterialUi.MuiThemeProvider;
      const Provider = ReactRedux.Provider;

      return (
        <MuiThemeProvider muiTheme={MaterialUi.getMuiTheme()}>
          <Provider store={stateStore}>
            <div>
              <LayoutTopnavComponent />
              <LayoutHeaderComponent />
              <LayoutContentComponent />
            </div>
          </Provider>
        </MuiThemeProvider>
      );
    }
  });


  return LayoutMainComponent;
});