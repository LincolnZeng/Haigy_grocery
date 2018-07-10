module CartConcern
  extend ActiveSupport::Concern


  # only return in stock and non-category item infos.
  def getRealTimeStoreItemInfos(itemIdArray, storeIdArray)
    return StoreItemInfo.where(item_id: itemIdArray, store_id: storeIdArray, is_category_item: false, in_stock: true)
  end


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


  def getCart(cart, servableZipCode)
    @storeHash = getDeliverableStores(servableZipCode)
    @cartEntries = CartEntry.includes(:item).where(cart_id: cart.id)
    @itemStoreInfoHash = convertStoreItemInfoToHash(getCartRealTimeStoreItemInfos(cart.id, @storeHash.keys))
  end


  def getUserCart(userId, servableZipCode)
    begin
      @cart = Cart.where(user_id: userId, checked_out: false).first   # should have at most one unchecked out cart for each user
      if @cart.present?
        if @cart.secured_id.blank?
          @cart.secureCart
        end
        getCart(@cart, servableZipCode)
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
          @storeHash = {}
        rescue => error
          @errorCode = HaigyManageConstant::Error::CREATE_RECORD_FAILED
          @errorMessage = ["getUserCart error: cannot initialize a new cart. (", error.message, ")"].join("")
          return false
        end
      end
    rescue => error
      @errorCode = HaigyManageConstant::Error::UNEXPECTED_ERROR
      @errorMessage = ["getUserCart error: cannot get the user cart. (", error.message, ")"].join("")
      return false
    end
    return true
  end


  def createCart(cartEntryDataArray)
    cart = Cart.new(checked_out: false)

    if cartEntryDataArray.present?
      # the order of cart entries in the array should implicitly reflect the order that user added them into the cart
      cartEntryDataArray.each do |data|
        entry = CartEntry.new(
          item_id: data["item_id"],
          quantity: data["quantity"],
          unit_price: data["unit_price"],
          added_by_user: true
        )
        cart.cart_entries << entry
      end
    end

    return cart
  end

end