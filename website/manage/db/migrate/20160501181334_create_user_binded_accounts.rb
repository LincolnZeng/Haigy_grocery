class CreateUserBindedAccounts < ActiveRecord::Migration
  def change
    create_table :user_binded_accounts do |t|
      t.integer :account_type
      t.string :account
      t.references :user, index: true

      t.timestamps
    end

    add_index :user_binded_accounts, [:account_type, :account], unique: true
  end
end
