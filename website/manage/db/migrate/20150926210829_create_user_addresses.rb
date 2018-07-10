class CreateUserAddresses < ActiveRecord::Migration
  def change
    create_table :user_addresses do |t|
      t.references :user, index: true

      t.boolean :set_as_default, default: false

      t.boolean :is_business_address, default: false
      t.string :business_name
      t.string :input_address, limit: 1000
      t.string :note, default: ""

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
  end
end
