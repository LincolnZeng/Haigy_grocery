class ServableZipCode < ActiveRecord::Base
  belongs_to :service_area
  has_many :carts


  def self.getZipCodeId(zipCode)
    validatedZipCode = ServableZipCode.where(zip_code: zipCode).first
    if validatedZipCode.present?
      return validatedZipCode.id
    else
      return HaigyFulfillConstant::DefaultZipCode::SERVABLE_ZIP_CODE_ID
    end
  end


  def self.getZipCodeServiceAreaId(zipCode)
    validatedZipCode = ServableZipCode.where(zip_code: zipCode).first
    if validatedZipCode.present?
      return validatedZipCode.service_area_id
    else
      return HaigyFulfillConstant::DefaultZipCode::SERVICE_AREA_ID
    end
  end


  def self.getShoppingZipCode(deliveryZipCode)
    servableAddressZipCode = ServableZipCode.where(zip_code: deliveryZipCode).first
    if servableAddressZipCode.present?
      return servableAddressZipCode.zip_code
    else
      return HaigyFulfillConstant::DefaultZipCode::ZIP_CODE
    end
  end
end
