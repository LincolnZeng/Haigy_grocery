class UserMailer < ActionMailer::Base
  default from: "noreply@haigy.com"


  def welcome(user)
    @user = user
    mail(to: @user.email, subject: "Welcome to Haigy.com")
  end


  def recoverPassword(user, temporaryPassword, temporaryPasswordLifetimeInMinutes)
    @user = user
    @temporaryPassword = temporaryPassword
    @temporaryPasswordLifetimeInMinutes = temporaryPasswordLifetimeInMinutes
    mail(to: @user.email, subject: "Haigy Password Recovery")
  end
end
