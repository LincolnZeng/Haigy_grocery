class UserAddress < ActiveRecord::Base
  belongs_to :user


  # no auto-fetch coordinates for this model
  # "geocode" needs to be explicitly called to fetch coordinates
  geocoded_by :input_address do |obj, results|
    if geoResult = results.first
      obj.latitude = geoResult.latitude
      obj.longitude = geoResult.longitude

      obj.formatted_address = geoResult.address
      obj.city = geoResult.city

      position = obj.formatted_address.rindex(", " + (obj.city || ""))
      if position && position > 0
        obj.street_address = obj.formatted_address[0..(position - 1)]
      else
        obj.street_address = obj.formatted_address
      end

      obj.state = geoResult.state
      obj.state_code = geoResult.state_code
      obj.postal_code = geoResult.postal_code
      obj.country = geoResult.country
      obj.country_code = geoResult.country_code
      obj.google_place_id = geoResult.data["place_id"]

      obj.geocoding_status = true
    else
      obj.geocoding_status = false
    end
  end
end
