class Cart < ActiveRecord::Base
  belongs_to :user
  belongs_to :servable_zip_code
  has_many :cart_entries, dependent: :destroy
  has_one :order, dependent: :destroy
end
