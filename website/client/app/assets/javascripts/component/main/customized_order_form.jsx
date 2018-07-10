modulejs.define("component/main/customized_order_form", [
  "react",
  "component/main/_feedback_form"
], function(React, MainFeedbackformComponent) {
  "use strict";


  var MainCustomizedorderformComponent = React.createClass({
    render() {
      return <MainFeedbackformComponent
        formHeader="Customized Order Form"
        formDescription="Would you please leave us a message for your customized order request. We will get back to you shortly."
        contentType="Customized Order"
        contentHintText="Your Message"
        requireContactMethod={true}
        feedbackSavedReminderMessage="Thank you very much for placing a customized order. We will get back to you soon!"
      />;
    }
  });


  return MainCustomizedorderformComponent;
});