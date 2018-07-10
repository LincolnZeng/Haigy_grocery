class AddStripePaymentColumnsToOrders < ActiveRecord::Migration
  def change
    add_column :orders, :is_paid, :boolean, null: false, default: false
    add_column :orders, :total_amount_paid, :float, null: false, default: 0.0
    add_column :orders, :is_stripe_payment, :boolean, null: false, default: false
    add_column :orders, :stripe_token_id, :string, null: false, default: ""
    add_column :orders, :stripe_charge_id, :string, null: false, default: ""
  end
end
