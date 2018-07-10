class CreateUserSessions < ActiveRecord::Migration
  def change
    create_table :user_sessions do |t|
      t.references :user, index: true
      t.string :secured_id
      t.string :secret_hash
      t.timestamp :expire_time

      t.timestamps
    end
    add_index :user_sessions, :secured_id
  end
end
