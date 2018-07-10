class FeedbackMailer < ActionMailer::Base
  helper ApplicationHelper
  default from: ["feedback", HaigyClientConstant::Email::FROM_DOMAIN].join("")


  def newFeedback(feedback)
    @feedback = feedback
    mail(to: "archive@haigy.com", subject: ["New ", @feedback.content_type, " Comes!"].join(""))
  end
end
