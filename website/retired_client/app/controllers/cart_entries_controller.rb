class CartEntriesController < ApplicationController

  def synchronizeAll
    begin
      @cartId = params[:cart_id]
      @specialRequests = nil
      zipcode = params[:zip_code]

      if zipcode.present?
        @storeHash = getDeliverableStores(zipcode)

        if @cartId.present?   # grab the latest item prices for a user's cart
          @cartId = @cartId.to_i
          cart = Cart.find(@cartId)
          if cart.present? && cart.servable_zip_code_id == ServableZipCode.getZipCodeId(zipcode)
            @cartEntries = CartEntry.includes(:item).where(cart_id: @cartId)
            @specialRequests = cart.special_requests

            realTimeStoreItemInfos = getCartRealTimeStoreItemInfos(@cartId)   # this function is defined in the "CartConcern" module
            @realTimeStoreItemInfoHash = convertStoreItemInfoToHash(realTimeStoreItemInfos)   # this function is defined in the "CartConcern" module
          else
            renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Cart is not found or has different zip code.")
            return
          end
        else   # grab the latest item prices for the guest cart
          cartEntryData = params[:cart]
          if cartEntryData.present?
            allItemId = []

            # the order for cart entries in this array is important. it should be the order that user added them into the cart
            cartEntryData.each do |index, data|
              allItemId << data[:item_id]
            end

            @cartEntries = []
            cartItemsHash = convertCollectionToHash(Item.where(id: allItemId))

            cartEntryData.each do |index, data|
              item = cartItemsHash[data[:item_id].to_i]
              if item.present?
                @cartEntries << CartEntry.new(
                  quantity: data[:quantity],
                  need_substitution: data[:need_substitution],
                  substitutional_items: data[:substitutional_items],
                  item: item
                )
              end
            end

            realTimeStoreItemInfos = getRealTimeStoreItemInfos(allItemId, @storeHash.keys)   # this function is defined in the "CartConcern" module
            @realTimeStoreItemInfoHash = convertStoreItemInfoToHash(realTimeStoreItemInfos)   # this function is defined in the "CartConcern" module
          else
            renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Cart item data are required.")
            return
          end
        end
      else
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Zip code is required.")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def update
    begin
      @cartEntry = CartEntry.includes(:item).find(params[:id])
      if @cartEntry.present?
        @cartEntry.update(cartEntryParams)
      else
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the cart entry.")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def create
    begin
      user = getUserFromRequestToken
      return if user.blank?   # Token is invalid

      inputParams = cartEntryParams

      ActiveRecord::Base.transaction do
        @item = Item.find(inputParams[:item_id])
        if @item.present?
          if inputParams[:cart_id].present?
            userCart = Cart.find(inputParams[:cart_id])
            if userCart.blank? || userCart.checked_out
              renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Cannot find the cart, or the cart has been checked out.")
              return
            end
          else
            userCart = Cart.where(user_id: user.id, checked_out: false).first   # should have at most one unchecked out cart for each user
            unless userCart.present?
              servableZipCode = ServableZipCode.where(zip_code: user.default_zip_code).first
              if servableZipCode.present?
                servableZipCodeId = servableZipCode.id
              else
                servableZipCodeId = HaigyClientConstant::Demo::SERVABLE_ZIP_CODE_ID
              end
              userCart = Cart.create(
                user_id: user.id,
                servable_zip_code_id: servableZipCodeId,
                checked_out: false
              )
            end
          end

          begin
            inputParams.delete(:zip_code)
            @cartEntry = CartEntry.new(inputParams)
            @cartEntry.cart_id = userCart.id

            @cartEntry.save
          rescue => error
            renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create a cart entry. (", error.message, ")"].join(""))
            return
          end
        else
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the item.")
          return
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def destroy
    begin
      @cartEntry = CartEntry.includes(:item).find(params[:id])
      if @cartEntry.present?
        @cartEntry.destroy
      else
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the cart entry.")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  include CartConcern


  def cartEntryParams
    params.require(:cart_entry).permit(
      :id,
      :cart_id,
      :item_id,
      :store_id,
      :zip_code,
      :unit_price,
      :quantity,
      :need_substitution,
      :substitutional_items
    )
  end

end
