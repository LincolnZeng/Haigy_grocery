class StoreItemInfo < ActiveRecord::Base
  belongs_to :store
  belongs_to :item
  has_many :feed_mappings, dependent: :destroy
end
