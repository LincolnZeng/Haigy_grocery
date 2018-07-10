class Order < ActiveRecord::Base
  belongs_to :cart
  belongs_to :user


  def secureOrder(isGuestOrder)
    prefix = isGuestOrder ? "g" : "u"
    self.secured_id = [prefix, Time.now.to_i, "-", SecureRandom.uuid].join("")
  end
end
