class CreateOrders < ActiveRecord::Migration
  def change
    create_table :orders do |t|
      t.boolean :is_guest_order
      t.integer :status, default: HaigyManageConstant::Order::STATUS[:placed]
      t.string :secured_id
      t.timestamp :expire_time

      t.boolean :is_business_address
      t.string :business_name
      t.string :street_address, null: false, default: ""
      t.string :city, null: false, default: ""
      t.string :state, null: false, default: ""
      t.string :zip_code, null: false, default: ""
      t.string :email, null: false, default: ""
      t.string :phone, null: false, default: ""
      t.string :note

      t.float :delivery_fee, null: false, default: 0.0
      t.integer :delivery_date, null: false, default: 0
      t.integer :delivery_time_slot_start_time, null: false, default: 0
      t.integer :delivery_time_slot_end_time, null: false, default: 0

      t.references :user, index: true

      t.timestamps
    end
    add_index :orders, :status
    add_index :orders, :secured_id
    add_index :orders, :delivery_date
    add_index :orders, :delivery_time_slot_start_time
    add_index :orders, :delivery_time_slot_end_time
  end
end
