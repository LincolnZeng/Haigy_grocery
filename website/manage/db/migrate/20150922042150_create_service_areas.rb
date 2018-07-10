class CreateServiceAreas < ActiveRecord::Migration
  def up
    create_table :service_areas do |t|
      t.string :name
      t.string :office_address, limit: 1000
      t.string :description, limit: 2000

      t.string :formatted_address, limit: 1000
      t.string :street_address, limit: 1000
      t.string :city
      t.string :state
      t.string :state_code
      t.string :postal_code
      t.string :country
      t.string :country_code
      t.string :google_place_id
      t.float :latitude
      t.float :longitude
      t.boolean :geocoding_status, default: false

      t.timestamps
    end

    execute "ALTER TABLE service_areas AUTO_INCREMENT = 10000"
    add_index :service_areas, :name, unique: true
  end


  def down
    remove_index :service_areas, :name
    drop_table :service_areas
  end
end
