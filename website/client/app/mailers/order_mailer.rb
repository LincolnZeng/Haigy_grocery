class OrderMailer < ActionMailer::Base
  helper ApplicationHelper
  default from: ["order", HaigyClientConstant::Email::FROM_DOMAIN].join("")


  def placed(order)
    @order = order
    fromEmailAddress = ["order_placed", HaigyClientConstant::Email::FROM_DOMAIN].join("")

    if @order.email.present?
      mail(to: @order.email, from: fromEmailAddress, bcc: "archive@haigy.com", subject: "Your order has been successfully placed.")
    else
      mail(to: "archive@haigy.com", from: fromEmailAddress, subject: "Need to manually notify user: order placed")
    end
  end
end
