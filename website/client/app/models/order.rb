class Order < ActiveRecord::Base
  belongs_to :user
  has_one :cart, dependent: :destroy

  def secureOrder
    self.secured_id = [self.id, "-", SecureRandom.random_number(1000000).to_s.rjust(6, "0")].join("")
    self.save
  end
end
