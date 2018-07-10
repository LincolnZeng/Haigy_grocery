modulejs.define("component/main/contact_us", [
  "react",
  "component/main/_feedback_form"
], function(React, MainFeedbackformComponent) {
  "use strict";


  var MainContactusComponent = React.createClass({
    render() {
      return <MainFeedbackformComponent
        formHeader="Contact Us or Feedbacks"
        formDescription="Would you please leave us a message. We will get back to you shortly. If you would prefer to send us an email, could you please send to: dingyu.zhou@haigy.com"
        contentType="Feedback"
        contentHintText="Your Message"
        requireContactMethod={false}
        feedbackSavedReminderMessage="Thank you very much for leaving us a message. We will get back to you soon!"
      />;
    }
  });


  return MainContactusComponent;
});