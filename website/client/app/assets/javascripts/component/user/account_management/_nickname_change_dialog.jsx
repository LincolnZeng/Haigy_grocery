modulejs.define("component/user/account_management/_nickname_change_dialog", [
  "logger",
  "react",
  "material_ui",
  "lib/validator",
  "app/constant",
  "app/cached_request",
  "app/error_handler",
  "model/user"
], function(logger, React, MaterialUi, validator, constant, cachedRequest,
  errorHandler, userModel
) {
  "use strict";


  const UserAccountmanagementNicknamechangedialogComponent = React.createClass({
    propTypes: {
      open: React.PropTypes.bool,
      onRequestClose: React.PropTypes.func,
      nickname: React.PropTypes.string,
      userId: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
      ]),
      nicknameSetCallback: React.PropTypes.func
    },


    getDefaultProps: function() {
      return {
        userId: null,
        onRequestClose: function() {},
        nicknameSetCallback: function() {}
      };
    },


    getInitialState() {
      return {
        loading: false,
        nickname: "",
        nicknameError: ""
      };
    },


    render() {
      const Dialog = MaterialUi.Dialog;
      const RaisedButton = MaterialUi.RaisedButton;
      const TextField = MaterialUi.TextField;
      const CircularProgress = MaterialUi.CircularProgress;

      var saveButton = null;
      if (this.state.loading) {
        saveButton = (<div className="haigy-text-align-center"><CircularProgress size={0.5} /><br /><span>...</span></div>);
      } else {
        saveButton = (<div><RaisedButton className="haigy-width-100-percent" label="Save" type="submit" primary={true} /></div>);
      }

      var header = null;
      if (this.props.nickname) {
        header = "Change Nickname";
      } else {
        header = "Set Nickname";
      }

      var content = (
        <div className="haigy-width-100-percent haigy-text-align-center">
          <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-400px haigy-text-align-left">
            <br />
            <strong className="haigy-font-large">{header}</strong>
            <form onSubmit={this.onSubmit}>
              <div>
                <TextField
                  floatingLabelText="Nickname" type="text" fullWidth={true}
                  value={this.state.nickname} onChange={this.onNicknameChange}
                  errorText={this.state.nicknameError}
                />
              </div>
              <br />
              {saveButton}
              <br />
            </form>
          </div>
        </div>
      );

      return (
        <Dialog
          open={this.props.open}
          onRequestClose={this.props.onRequestClose}
          autoDetectWindowHeight={false}
          style={constant.materialUi.DIALOG_STYLE}
        >
          {content}
        </Dialog>
      );
    },


    componentWillMount() {
      this.getNickname(this.props);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getNickname(nextProps);
    },


    getNickname(props) {
      this.setState({nickname: props.nickname});
    },


    onNicknameChange(event) {
      this.setState({
        nickname: event.currentTarget.value,
        nicknameError: ""
      });
    },


    onSubmit(event) {
      event.preventDefault();

      if (this.state.loading !== true) {
        var that = this;

        var nickname = that.state.nickname.trim();
        var inputValid = validator.minLength(nickname, 1, false, function(invalidMessage) {
          that.setState({nicknameError: invalidMessage});
        });

        if (inputValid) {
          if (that.props.userId) {
            that.setState({loading: true});
            cachedRequest.saveModel(userModel, {
              id: that.props.userId,
              nickname: nickname
            }, {
              success: function(savedUser) {
                var savedNickname = savedUser.get("nickname");
                that.setState({loading: false, nickname: savedNickname});
                that.props.nicknameSetCallback(savedNickname);
                that.props.onRequestClose();
              },

              error: function(model, jqXHR) {
                logger(jqXHR);
                errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
              }
            });
          } else {
            that.props.nicknameSetCallback(nickname);
            that.props.onRequestClose();
          }
        }
      }
    }
  });


  return UserAccountmanagementNicknamechangedialogComponent;
});