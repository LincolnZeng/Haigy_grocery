class ChangeUserBindedAccountsIndex < ActiveRecord::Migration
  def up
    remove_index :user_binded_accounts, [:account_type, :account]
    add_index :user_binded_accounts, [:account_type, :account]
  end


  def down
    remove_index :user_binded_accounts, [:account_type, :account]
    add_index :user_binded_accounts, [:account_type, :account], unique: true
  end
end
