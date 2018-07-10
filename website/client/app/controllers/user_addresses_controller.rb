class UserAddressesController < ApplicationController

  def index
    begin
      @userAddresses = UserAddress.where(user_id: params[:user_id])
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def selectAddress
    begin
      @userAddress = UserAddress.find(params[:id])
      @shoppingZipCode = ServableZipCode.getShoppingZipCode(@userAddress.postal_code)

      unless @userAddress.set_as_default
        begin
          ActiveRecord::Base.transaction do
            UserAddress.where(user_id: @userAddress.user_id, set_as_default: true).update_all(set_as_default: false)
            User.where(id: @userAddress.user_id).update_all(default_zip_code: @userAddress.postal_code)
            @userAddress.set_as_default = true
            @userAddress.save
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
      @userAddress.geocode

      if @userAddress.street_address.blank? || @userAddress.city.blank? || @userAddress.state_code.blank? || @userAddress.postal_code.blank?
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Cannot find this address.")
        return
      end

      if onlyValidate
        @shoppingZipCode = ServableZipCode.getShoppingZipCode(@userAddress.postal_code)
      else
        begin
          user = User.find(@userAddress.user_id)
          if user.blank?
            renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the user.")
            return
          end

          ActiveRecord::Base.transaction do
            unless UserAddress.exists?(user_id: user.id)
              @userAddress.set_as_default = true
              user.default_zip_code = @userAddress.postal_code
              @shoppingZipCode = ServableZipCode.getShoppingZipCode(@userAddress.postal_code)
              user.save
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

      if @userAddress.input_address_changed?
        @userAddress.geocode
      end

      if @userAddress.street_address.blank? || @userAddress.city.blank? || @userAddress.state_code.blank? || @userAddress.postal_code.blank?
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Cannot find this address.")
        return
      end

      ActiveRecord::Base.transaction do
        if @userAddress.set_as_default
          @shoppingZipCode = ServableZipCode.getShoppingZipCode(@userAddress.postal_code)
          user = User.find(@userAddress.user_id)
          if user.blank?
            renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the user.")
            return
          end
          user.default_zip_code = @userAddress.postal_code
          user.save
        end

        begin
          @userAddress.save
        rescue => error
          renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update user address. (", error.message, ")"].join(""))
          return
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def show
    begin
      @userAddress = UserAddress.find(params[:id])
    rescue
      renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the address.")
      return
    end
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
      :input_address,
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
