module CartConcern
  extend ActiveSupport::Concern


  # only return in stock and non-category item infos.
  def getRealTimeStoreItemInfos(itemIdArray, storeIdArray)
    return StoreItemInfo.where(item_id: itemIdArray, store_id: storeIdArray, is_category_item: false, in_stock: true)
  end


  # only return in stock and non-category item infos.
  def getCartRealTimeStoreItemInfos(cartId)
    return StoreItemInfo.joins("INNER JOIN cart_entries ON store_item_infos.item_id = cart_entries.item_id AND store_item_infos.store_id = cart_entries.store_id")
      .where("cart_entries.cart_id = ?", cartId).where(is_category_item: false, in_stock: true)
  end


  def convertStoreItemInfoToHash(storeItemInfos)
    itemInfoHash = {}
    storeItemInfos.each do |info|
      itemInfoHash[info.item_id] = info
    end
    return itemInfoHash
  end


  def getUserCart(userId, servableZipCode)
    @cart = Cart.where(user_id: userId, checked_out: false).first   # should have at most one unchecked out cart for each user
    @specialRequests = nil
    @storeHash = getDeliverableStores(servableZipCode)
    servableZipCodeId = ServableZipCode.getZipCodeId(servableZipCode)
    if @cart.present?
      if @cart.servable_zip_code_id == servableZipCodeId
        @cartId = @cart.id
        @specialRequests = @cart.special_requests
        @cartEntries = CartEntry.includes(:item).where(cart_id: @cartId)
        @itemStoreInfoHash = convertStoreItemInfoToHash(getCartRealTimeStoreItemInfos(@cartId))
      else
        @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
        @errorMessage = "Cannot find the cart for this zip code."
        return false
      end
    else
      begin
        @cart = Cart.create(
          user_id: userId,
          servable_zip_code_id: servableZipCodeId,
          checked_out: false
        )
        @cartId = @cart.id
        @cartEntries = []
        @itemStoreInfoHash = {}
      rescue => error
        @errorCode = HaigyManageConstant::Error::CREATE_RECORD_FAILED
        @errorMessage = ["Cannot initialize a new cart. (", error.message, ")"].join("")
        return false
      end
    end
    return true
  end


  def createCart(cartEntryDataArray, special_requests, servableZipCodeId)
    if servableZipCodeId.present?
      cart = Cart.new(servable_zip_code_id: servableZipCodeId, special_requests: special_requests, checked_out: false)

      if cartEntryDataArray.present?
        # the order of cart entries in the array should implicitly reflect the order that user added them into the cart
        cartEntryDataArray.each do |data|
          entry = CartEntry.new(
            item_id: data["item_id"],
            store_id: data["store_id"],
            quantity: data["quantity"],
            unit_price: data["unit_price"],
            need_substitution: data["need_substitution"]
          )
          cart.cart_entries << entry
        end
      end

      return cart
    end

    return nil
  end

end