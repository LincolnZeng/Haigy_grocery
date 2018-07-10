class CreateItemImages < ActiveRecord::Migration
  def change
    create_table :item_images do |t|
      t.attachment :image
      t.boolean :customer_viewable, null: false, default: true
      t.references :item, index: true

      t.timestamps
    end

    add_index :item_images, :customer_viewable
  end
end
