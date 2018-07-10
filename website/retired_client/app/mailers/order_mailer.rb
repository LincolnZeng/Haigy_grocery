class OrderMailer < ActionMailer::Base
  default from: "noreply@haigy.com"


  def placed(order)
    @order = order
    mail(to: @order.email, bcc: "haigy.com@gmail.com", subject: "Your Haigy.com order has been successfully placed.")
  end
end
