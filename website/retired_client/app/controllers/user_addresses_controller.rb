class UserAddressesController < ApplicationController

  def index
    begin
      @userAddresses = UserAddress.where(user_id: params[:user_id])
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def changeZipCode
    begin
      userId = params[:user_id]
      begin
        newZipCode = params[:new_zip_code]
        oldZipCode = (params[:old_zip_code] || "").to_s
        allCartItemIdArray = params[:all_item_id_in_cart] || []
        @unavailableItemsIdArray = getUnavailableItemsInCartForNewZipCode(newZipCode, oldZipCode, allCartItemIdArray)
        return if @unavailableItemsIdArray.nil?   # has unexpected error

        validatedNewZipCode = ServableZipCode.where(zip_code: newZipCode).first
        if validatedNewZipCode.present?
          servableZipCodeId = validatedNewZipCode.id
          @service_area_id = validatedNewZipCode.service_area_id
        else
          servableZipCodeId = HaigyClientConstant::Demo::SERVABLE_ZIP_CODE_ID
          @service_area_id = HaigyClientConstant::Demo::SERVICE_AREA_ID
        end

        ActiveRecord::Base.transaction do
          if userId.present?
            UserAddress.where(user_id: userId, set_as_default: true).update_all(set_as_default: false)

            if newZipCode.present? && newZipCode.to_s != oldZipCode
              User.where(id: userId).update_all(default_zip_code: newZipCode)
              Cart.where(user_id: userId, checked_out: false).update_all(servable_zip_code_id: servableZipCodeId)

              unless @unavailableItemsIdArray.empty?
                CartEntry.where(cart_id: params[:cart_id], item_id: @unavailableItemsIdArray).destroy_all
              end
            end
          end
        end
      rescue => error
        renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Fail to change the zip code. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def selectAddress
    begin
      @userAddress = UserAddress.find(params[:id])

      servableZipCode = ServableZipCode.where(zip_code: @userAddress.postal_code).first
      if servableZipCode.present?
        servableZipCodeId = servableZipCode.id
        @service_area_id = servableZipCode.service_area_id
      else
        servableZipCodeId = HaigyClientConstant::Demo::SERVABLE_ZIP_CODE_ID
        @service_area_id = HaigyClientConstant::Demo::SERVICE_AREA_ID
      end

      unless @userAddress.set_as_default
        begin
          allCartItemIdArray = params[:all_item_id_in_cart] || []
          @unavailableItemsIdArray = getUnavailableItemsInCartForNewZipCode(@userAddress.postal_code, params[:old_zip_code], allCartItemIdArray)
          return if @unavailableItemsIdArray.nil?   # has unexpected error

          ActiveRecord::Base.transaction do
            UserAddress.where(user_id: @userAddress.user_id, set_as_default: true).update_all(set_as_default: false)
            User.where(id: @userAddress.user_id).update_all(default_zip_code: @userAddress.postal_code)
            @userAddress.set_as_default = true
            @userAddress.save

            Cart.where(user_id: @userAddress.user_id, checked_out: false).update_all(servable_zip_code_id: servableZipCodeId)

            unless @unavailableItemsIdArray.empty?
              CartEntry.where(cart_id: params[:cart_id], item_id: @unavailableItemsIdArray).destroy_all
            end
          end
        rescue => error
          renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Fail to select a different user address. (", error.message, ")"].join(""))
          return
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def create
    begin
      onlyValidate = params[:only_validate]
      params.delete(:only_validate)

      @userAddress = UserAddress.new(userAddressParams)
      @userAddress.generateInputAddress
      @userAddress.geocode

      if @userAddress.street_address.blank? || @userAddress.city.blank? || @userAddress.state_code.blank? || @userAddress.input_zip_code != @userAddress.postal_code
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, ["Cannot find the address for the zip code: ", @userAddress.input_zip_code, "."].join(""))
        return
      end

      unless onlyValidate
        begin
          user = User.find(@userAddress.user_id)
          if user.blank?
            renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the user.")
            return
          end

          ActiveRecord::Base.transaction do
            if params[:cart_zip_code].to_s == @userAddress.postal_code
              unless UserAddress.exists?(user_id: user.id)
                @userAddress.set_as_default = true
                user.default_zip_code = @userAddress.postal_code
                user.save
              end
            end
            @userAddress.save
          end
        rescue => error
          renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create a user address. (", error.message, ")"].join(""))
          return
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def update
    begin
      @userAddress = UserAddress.find(params[:id])

      @userAddress.attributes = userAddressParams
      @userAddress.generateInputAddress

      if @userAddress.input_address_changed?
        @userAddress.geocode
      end

      if @userAddress.street_address.blank? || @userAddress.city.blank? || @userAddress.state_code.blank? || @userAddress.input_zip_code != @userAddress.postal_code
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, ["Cannot find the address for the zip code: ", @userAddress.input_zip_code, "."].join(""))
        return
      end

      if params[:cart_zip_code].to_s != @userAddress.postal_code   # update the default address and the new address has a different zip code
        @userAddress.set_as_default = false
      end

      begin
        @userAddress.save
      rescue => error
        renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update user address. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def show
  end


  def destroy
    begin
      begin
        @userAddress = UserAddress.find(params[:id])
      ensure
        if @userAddress.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the address.")
          return
        end
      end

      begin
        @userAddress.destroy
      rescue => error
        renderError(HaigyManageConstant::Error::DESTROY_RECORD_FAILED, ["Cannot destroy the address. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  def userAddressParams
    params.require(:user_address).permit(
      :id,
      :user_id,
      :is_business_address,
      :business_name,
      :input_street_address,
      :input_apt_number,
      :input_zip_code,
      :note,
      :set_as_default
    )
  end


  # return an array of all unavailable item IDs
  def getUnavailableItemsInCartForNewZipCode(newZipCode, oldZipCode, allCartItemIdArray)
    newZipCodeString = (newZipCode || "").to_s
    oldZipCodeString = (oldZipCode || "").to_s

    if allCartItemIdArray.empty? || newZipCodeString == oldZipCodeString
      return []
    else
      storeHash = getDeliverableStores(newZipCodeString)
      return nil if storeHash.nil?   # has unexpected error

      if storeHash.empty?   # not a servable zip code
        return allCartItemIdArray
      else
        stillAvailableItemId = Item.includes(:store_item_infos).where(
          id: allCartItemIdArray,
          store_item_infos: {store_id: storeHash.keys}
        ).pluck(:id)

        return allCartItemIdArray.map {|element| element.to_i} - stillAvailableItemId
      end
    end
  end

end
