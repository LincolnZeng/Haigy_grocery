modulejs.define("component/layout/_search_dialog", [
  "react",
  "material_ui",
  "app/constant",
  "app/navigator",
  "app/analytics"
], function(React, MaterialUi, constant, navigator, analytics) {
  "use strict";


  const LayoutSearchdialogComponent = React.createClass({
    propTypes: {
      dialogOpen: React.PropTypes.bool,
      onDialogClose: React.PropTypes.func
    },


    getDefaultProps() {
      return {
        dialogOpen: false,
        onDialogClose: function() {}
      };
    },


    getInitialState() {
      return {
        searchKeyword: "",
        searchKeywordError: ""
      };
    },


    render() {
      const Dialog = MaterialUi.Dialog;
      const RaisedButton = MaterialUi.RaisedButton;
      const TextField = MaterialUi.TextField;

      return (
        <Dialog
          open={this.props.dialogOpen}
          onRequestClose={this.onRequestClose}
          autoDetectWindowHeight={false}
          style={constant.materialUi.DIALOG_STYLE}
        >
          <div className="haigy-width-100-percent haigy-text-align-center">
            <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-300px haigy-text-align-left">
              <br />
              <div className="haigy-font-size-150"><strong>Search</strong></div>

              <form onSubmit={this.onSearchSubmit}>
                <div>
                  <TextField
                    floatingLabelText="Search Keyword" type="text" fullWidth={true}
                    value={this.state.searchKeyword} onChange={this.onSearchKeywordChange}
                    errorText={this.state.searchKeywordError}
                  />
                </div>
                <br />
                <div><RaisedButton fullWidth={true} label="Submit" type="submit" primary={true} /></div>
                <br />
              </form>
            </div>
          </div>
        </Dialog>
      );
    },


    onSearchKeywordChange(event) {
      this.setState({searchKeyword: event.currentTarget.value, searchKeywordError: ""});
    },


    onSearchSubmit(event) {
      event.preventDefault();
      var searchKeyword = (this.state.searchKeyword || "").toString();
      if (searchKeyword.length > 0) {
        this.onRequestClose();
        analytics.itemSearched(searchKeyword);
        navigator.briefinfoitemSearch(this.state.searchKeyword);
      } else {
        this.setState({searchKeywordError: "Search keyword cannot be blank."});
      }
    },


    onRequestClose() {
      this.props.onDialogClose();
    }
  });


  return LayoutSearchdialogComponent;
});