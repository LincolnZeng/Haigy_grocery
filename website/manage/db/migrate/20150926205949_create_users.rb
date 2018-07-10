class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.boolean :is_temporary, default: true
      t.string :nickname
      t.string :email
      t.string :phone
      t.string :default_zip_code
      t.boolean :subscribe_news
      t.string :password_hash
      t.string :temporary_password_hash
      t.timestamp :temporary_password_expiry_time

      t.timestamps
    end
    add_index :users, :email, unique: true
    add_index :users, :phone
    add_index :users, :subscribe_news
  end
end
