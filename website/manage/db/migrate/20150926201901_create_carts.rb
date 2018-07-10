class CreateCarts < ActiveRecord::Migration
  def change
    create_table :carts do |t|
      t.boolean :checked_out, default: false
      t.timestamp :checkout_time, default: nil
      t.string :secured_id

      t.references :user, index: true
      t.references :servable_zip_code, index: true
      t.references :order, index: true

      t.timestamps
    end

    add_index :carts, :secured_id
  end
end
