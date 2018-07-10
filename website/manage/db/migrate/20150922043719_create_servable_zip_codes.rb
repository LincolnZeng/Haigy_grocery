class CreateServableZipCodes < ActiveRecord::Migration
  def up
    create_table :servable_zip_codes do |t|
      t.references :service_area, index: true
      t.string :zip_code, null: false
      t.string :city
      t.string :state

      t.timestamps
    end

    execute "ALTER TABLE servable_zip_codes AUTO_INCREMENT = 10000"
    add_index :servable_zip_codes, :zip_code, unique: true
  end


  def down
    remove_index :servable_zip_codes, :zip_code
    drop_table :servable_zip_codes
  end
end
