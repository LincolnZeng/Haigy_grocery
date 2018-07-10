class CreateStoreItemInfos < ActiveRecord::Migration
  def change
    create_table :store_item_infos do |t|
      t.boolean :is_category_item, default: false

      # this will be used when has_fixed_item_size is set to false in the items table
      t.float :estimated_weight_of_each_in_lb, null: false, default: 0.0

      t.float :price, null: false, default: 0.0
      t.float :sale_price, null: false, default: 0.0
      t.boolean :on_sale, null: false, default: false
      t.boolean :in_stock, null: false, default: true
      t.timestamp :out_of_stock_since, null: false, default: Time.new(2016)
      t.float :quantity, null: false, default: 0
      t.string :note
      t.references :store, index: true
      t.references :item, index: true

      t.timestamps
    end

    add_index :store_item_infos, [:store_id, :item_id], unique: true
    add_index :store_item_infos, :in_stock
    add_index :store_item_infos, :on_sale
  end
end
