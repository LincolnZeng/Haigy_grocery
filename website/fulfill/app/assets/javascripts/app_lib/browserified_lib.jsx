// ---------- ---------- ---------- ---------- ---------- ----------
// Put all browserified libs together to avoid duplicate lib copies
// ---------- ---------- ---------- ---------- ---------- ----------



// ---------- React ----------

import React from "react";
modulejs.define("react", function() {
  return React;
});


import ReactDom from "react-dom";
modulejs.define("reactdom", function() {
  return ReactDom;
});



// ---------- Material UI ----------

var injectTapEventPlugin = require("react-tap-event-plugin");

// Needed for onTouchTap
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


import MaterialUiMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import MaterialUiGetMuiTheme from "material-ui/styles/getMuiTheme";
import MaterialUiCircularProgress from "material-ui/CircularProgress";
import MaterialUiDialog from "material-ui/Dialog";
import MaterialUiFlatButton from "material-ui/FlatButton";
import MaterialUiMenuItem from "material-ui/MenuItem";
import {RadioButton as MaterialUiRadioButton, RadioButtonGroup as MaterialUiRadioButtonGroup} from "material-ui/RadioButton";
import MaterialUiRaisedButton from "material-ui/RaisedButton";
import MaterialUiSelectField from "material-ui/SelectField";
import MaterialUiTextField from "material-ui/TextField";


modulejs.define("material_ui", function() {
  return {
    getMuiTheme: MaterialUiGetMuiTheme,
    MuiThemeProvider: MaterialUiMuiThemeProvider,

    CircularProgress: MaterialUiCircularProgress,
    Dialog: MaterialUiDialog,
    FlatButton: MaterialUiFlatButton,
    MenuItem: MaterialUiMenuItem,
    RadioButton: MaterialUiRadioButton,
    RadioButtonGroup: MaterialUiRadioButtonGroup,
    RaisedButton: MaterialUiRaisedButton,
    SelectField: MaterialUiSelectField,
    TextField: MaterialUiTextField
  };
});
