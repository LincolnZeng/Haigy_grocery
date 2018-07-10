class CartEntry < ActiveRecord::Base
  belongs_to :cart
  belongs_to :item
end
