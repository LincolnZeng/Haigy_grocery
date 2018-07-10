module CartConcern

  extend ActiveSupport::Concern


  # only return in stock and non-category item infos.
  def getCartRealTimeStoreItemInfos(cartId, availableStoreIdArray)
    return StoreItemInfo.joins("INNER JOIN cart_entries ON store_item_infos.item_id = cart_entries.item_id")
      .where(is_category_item: false, in_stock: true, cart_entries: {cart_id: cartId}, store_item_infos: {store_id: availableStoreIdArray})
  end


  def convertStoreItemInfoToHash(storeItemInfos)
    itemInfoHash = {}
    storeItemInfos.each do |info|
      itemInfoHash[info.item_id] = info
    end
    return itemInfoHash
  end


  def getUserCart(userId, servableZipCode)
    begin
      @storeHash = getDeliverableStores(servableZipCode)
      @cart = Cart.where(user_id: userId, checked_out: false).first   # should have at most one unchecked out cart for each user
      if @cart.present?
        @cartEntries = CartEntry.includes(:item).where(cart_id: @cart.id)
        @itemStoreInfoHash = convertStoreItemInfoToHash(getCartRealTimeStoreItemInfos(@cart.id, @storeHash.keys))
      else
        begin
          ActiveRecord::Base.transaction do
            @cart = Cart.create(
              user_id: userId,
              checked_out: false
            )
            @cart.secureCart
          end
          @cartEntries = []
          @itemStoreInfoHash = {}
        rescue => error
          @errorCode = HaigyManageConstant::Error::CREATE_RECORD_FAILED
          @errorMessage = ["Cannot initialize a new cart. (", error.message, ")"].join("")
          return false
        end
      end
    rescue => error
      @errorCode = HaigyManageConstant::Error::UNEXPECTED_ERROR
      @errorMessage = error.message
      return false
    end
    return true
  end

end