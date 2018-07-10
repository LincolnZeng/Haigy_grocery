class CreateFeedMappings < ActiveRecord::Migration
  def change
    create_table :feed_mappings do |t|
      t.references :store_item_info, index: true
      t.string :instacart_id

      t.timestamps
    end
    add_index :feed_mappings, :instacart_id
  end
end
