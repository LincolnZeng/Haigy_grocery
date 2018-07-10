class CreateFeedbacks < ActiveRecord::Migration
  def change
    create_table :feedbacks do |t|
      t.string :user_email
      t.string :user_phone
      t.string :content_type
      t.text :content, limit: 1000000000
      t.integer :user_id
      t.string :user_ip_address
      t.string :user_local_time

      t.timestamps
    end

    add_index :feedbacks, :created_at
  end
end
