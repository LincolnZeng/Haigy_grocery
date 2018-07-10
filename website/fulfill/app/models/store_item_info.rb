class StoreItemInfo < ActiveRecord::Base
  belongs_to :store
  belongs_to :item
  has_many :feed_mappings, dependent: :destroy


  searchable do
    integer :store_id
    boolean :in_stock
    integer :item_id
  end
end
