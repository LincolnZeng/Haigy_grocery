modulejs.define("component/feedback/index", [
  "logger",
  "react",
  "reactdom",
  "app/cached_request",
  "app/constant",
  "app/navigator",
  "app/error_handler",
  "app/utility",
  "app/cookie",
  "collection/feedback/index",
  "component/main/_loading"
], function(logger, React, ReactDOM, cachedRequest, constant, navigator, errorHandler,
  utility, cookie, feedbackIndexCollection, ComponentMainLoading
) {
  "use strict";


  var ComponentFeedbackIndex = React.createClass({
    getInitialState: function() {
      return {
        loading: true, fetchedFeedbacks: []
      };
    },


    render: function() {
      var content = null;

      if (this.state.loading) {
        content = <div><ComponentMainLoading /></div>;
      } else {
        if (this.state.fetchedFeedbacks.length > 0) {
          var feedbackList = this.state.fetchedFeedbacks.map(function(feedback) {
            var userIdInfo = null;
            var userId = feedback.get("user_id");
            if (userId) {
              userIdInfo = <div>User ID: {userId}</div>;
            }

            return (
              <div className="item" key={feedback.id}>
                <div className="content">
                  <br />
                  <div className="header">{feedback.get("content_type")} ({feedback.get("created_at")})</div>
                  <div className="description">
                    <br />
                    {userIdInfo}
                    <div>User IP Address: {feedback.get("user_ip_address")}</div>
                    <div>User Local Time: {feedback.get("user_local_time")}</div>
                    <div>User Email: {feedback.get("user_email") || "not provided"}</div>
                    <div>User Phone: {feedback.get("user_phone") || "not provided"}</div>
                    <br />
                    <div>Content:</div>
                    <div className="haigy-padding-l-30px"><pre style={{whiteSpace: "pre-wrap"}}>{feedback.get("content")}</pre></div>
                  </div>
                  <br />
                </div>
              </div>
            );
          });

          content = <div className="ui relaxed divided list">{feedbackList}</div>;
        } else {
          content = <h3>No feedback is found.</h3>;
        }
      }

      return (
        <div>
          {content}
        </div>
      );
    },


    getFeedbackData() {
      var that = this;

      cachedRequest.fetchCollection(feedbackIndexCollection, {from: this.from, to: this.to}, {
        success: function(fetchedCollection) {
          that.setState({loading: false, fetchedFeedbacks: fetchedCollection.models});
        },

        error: function(collection, jqXHR) {
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[component/feedback/index] - ", jqXHR.responseJSON.error_message].join(""));
        }
      });
    },


    componentWillMount() {
      this.getFeedbackData(this.props.options);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getFeedbackData(nextProps.options);
    }
  });


  return ComponentFeedbackIndex;
});
