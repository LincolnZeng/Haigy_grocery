class UserMailer < ActionMailer::Base
  helper ApplicationHelper
  default from: ["greeting", HaigyClientConstant::Email::FROM_DOMAIN].join("")


  def welcome(user)
    @user = user
    mail(to: @user.email, from: ["welcome", HaigyClientConstant::Email::FROM_DOMAIN].join(""), bcc: "archive@haigy.com", subject: "Welcome to Haigy")
  end


  def recoverPassword(user, temporaryPassword, temporaryPasswordLifetimeInMinutes)
    @user = user
    @temporaryPassword = temporaryPassword
    @temporaryPasswordLifetimeInMinutes = temporaryPasswordLifetimeInMinutes
    mail(to: @user.email, from: ["recover_password", HaigyClientConstant::Email::FROM_DOMAIN].join(""), subject: "Haigy Password Recovery")
  end
end
