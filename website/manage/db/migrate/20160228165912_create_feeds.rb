class CreateFeeds < ActiveRecord::Migration
  def change
    create_table :feeds do |t|
      t.string :name
      t.text :source, limit: 10000
      t.text :data_summary, limit: 1000000000
      t.timestamp :latest_feed_time, null: false, default: Time.new(2016)
      t.boolean :is_processing, null: false, default: false
      t.boolean :has_process_error, null: false, default: false
      t.text :process_error_message, limit: 10000

      t.timestamps
    end

    add_index :feeds, :name
  end
end
