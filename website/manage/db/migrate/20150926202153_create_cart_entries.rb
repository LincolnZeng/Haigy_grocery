class CreateCartEntries < ActiveRecord::Migration
  def change
    create_table :cart_entries do |t|
      t.references :cart, index: true
      t.references :item, index: true
      t.references :store, index: true
      t.float :unit_price, default: nil
      t.float :quantity, default: 0
      t.boolean :returned, default: false
      t.boolean :added_by_user, default: true
      t.string :additional_info

      t.timestamps
    end

    add_index :cart_entries, [:item_id, :cart_id], unique: true
  end
end
