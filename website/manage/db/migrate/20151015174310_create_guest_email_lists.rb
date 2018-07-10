class CreateGuestEmailLists < ActiveRecord::Migration
  def change
    create_table :guest_email_lists do |t|
      t.string :email

      t.timestamps
    end
    add_index :guest_email_lists, :email, unique: true
  end
end
