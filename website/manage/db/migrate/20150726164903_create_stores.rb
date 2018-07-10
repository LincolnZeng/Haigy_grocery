class CreateStores < ActiveRecord::Migration
  def change
    create_table :stores do |t|
      t.string :company_name

      # store_name = company_name + " - " + "StoreCity, State ZipCode" [+ " - " + other_meaningful_distinguisher_if_necessary]
      # characters in "store_name" should be all in lowercase to prevent future naming confusion
      t.string :store_name

      t.boolean :is_haigy_base, default: false

      t.references :company, index: true
      t.references :service_area, index: true

      t.string :input_address, limit: 1000
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

    add_index :stores, :is_haigy_base
    add_index :stores, :store_name, unique: true
  end
end
