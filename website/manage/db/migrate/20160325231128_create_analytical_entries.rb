class CreateAnalyticalEntries < ActiveRecord::Migration
  def change
    create_table :analytical_entries do |t|
      t.string :source
      t.string :keyword
      t.integer :user_id
      t.string :user_ip_address
      t.string :user_local_time
      t.text :details

      t.timestamps
    end

    add_index :analytical_entries, :created_at
  end
end
