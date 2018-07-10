class Cart < ActiveRecord::Base
  belongs_to :user
  belongs_to :servable_zip_code
  belongs_to :order
  has_many :cart_entries, dependent: :destroy


  def secureCart
    self.secured_id = [SecureRandom.urlsafe_base64(6), "-", self.id].join("")
    self.save
  end
end
