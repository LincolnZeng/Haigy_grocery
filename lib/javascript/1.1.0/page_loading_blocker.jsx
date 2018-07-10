modulejs.define("haigy/lib/1.1.0/page_loading_blocker", [
  "react",
  "reactdom",
  "material_ui"
], function(React, ReactDOM, MaterialUi) {
  "use strict";


  const PageloadingblockerComponent = React.createClass({
    propTypes: {
      open: React.PropTypes.bool,
      title: React.PropTypes.string,
      confirmMessage: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.node
      ])
    },


    getDefaultProps: function() {
      return {
        open: false,
        title: "Loading",
        confirmMessage: ""
      };
    },


    render() {
      const MuiThemeProvider = MaterialUi.MuiThemeProvider;
      const Dialog = MaterialUi.Dialog;
      const CircularProgress = MaterialUi.CircularProgress;

      return (
        <MuiThemeProvider muiTheme={MaterialUi.getMuiTheme()}>
          <Dialog title={this.props.title} modal={true} open={this.props.open}>
            <div className="haigy-text-align-center">
              <CircularProgress size={0.8} /><br />
              <i>{this.props.loadingMessage}</i>
            </div>
          </Dialog>
        </MuiThemeProvider>
      );
    }
  });


  var PageLoadingBlocker = function(domContainerNode, title, loadingMessage) {
    this.isModalOpen = false;
    this.domContainerNode = domContainerNode;
    this.setTitleAndLoadingMessage(title, loadingMessage);
  };


  PageLoadingBlocker.prototype.setTitleAndLoadingMessage = function(title, loadingMessage) {
    this.title = title;
    this.loadingMessage = loadingMessage;
  };


  PageLoadingBlocker.prototype.hasDomContainerNode = function() {
    if (this.domContainerNode) {
      return true;
    } else {
      return false;
    }
  };


  PageLoadingBlocker.prototype.isOpen = function() {
    return this.isModalOpen;
  };


  PageLoadingBlocker.prototype.open = function(title, loadingMessage) {
    if (this.domContainerNode) {
      if (title) {
        this.title = title;
      }
      if (loadingMessage) {
        this.loadingMessage = loadingMessage;
      }

      ReactDOM.render(
        <PageloadingblockerComponent
          open={true}
          title={this.title}
          loadingMessage={this.loadingMessage}
        />,
        this.domContainerNode
      );

      this.isModalOpen = true;
    }
  };


  PageLoadingBlocker.prototype.close = function() {
    if (this.domContainerNode) {
      ReactDOM.render(
        <PageloadingblockerComponent
          open={false}
          title={this.title}
          loadingMessage={this.loadingMessage}
        />,
        this.domContainerNode
      );

      this.isModalOpen = false;
    }
  };


  return PageLoadingBlocker;
});