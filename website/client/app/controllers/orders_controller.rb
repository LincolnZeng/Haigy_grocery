class OrdersController < ApplicationController


  def index
    begin
      @orders = Order.where(user_id: params[:user_id]).order(id: :desc)
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def create
    begin
      @order = nil

      @errorCode = nil
      @errorMessage = nil

      createOrderSuccess = createOrder(params)

      unless createOrderSuccess
        if @errorCode == HaigyManageConstant::Error::ITEM_INFO_OUTDATED
          renderError(HaigyManageConstant::Error::ITEM_INFO_OUTDATED, ["Place order failed. (", @errorMessage, ")"].join(""))
          return
        end

        if @order.nil? || @order.new_record?
          logger.fatal ["Create Order Error: ", @errorMessage, " (", @errorCode ,")"].join("")
          renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Place order failed. (", @errorMessage, ")"].join(""))
          return
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def update
  end


  def destroy
  end


  def show
    begin
      securedId = params[:id]   # always use secured_id to do the order fetching
      @order = Order.where(secured_id: securedId).first
      if @order.present?
        if @order.is_guest_order
          if @order.status == HaigyManageConstant::Order::STATUS[:delivered]
            if @order.expire_time.blank? || @order.expire_time < Time.now
              renderError(HaigyManageConstant::Error::NOT_ALLOWED, "This guest order is no longer viewable.")
              return
            end
          end
        else
          user = getUserFromRequestToken(true)
          if user.present?
            if @order.user_id != user.id
              renderError(HaigyManageConstant::Error::NOT_ALLOWED, "This order does not belong to the user currently signed in.")
              return
            end
          else
            renderError(HaigyManageConstant::Error::SIGN_IN_REQUIRED, "Please sign in first.")
            return
          end
        end

        @cart = Cart.where(order_id: @order.id).first
        if @cart.present?
          @cartEntries = CartEntry.includes(:item).where(cart_id: @cart.id).order(id: :desc)
        else
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the cart.")
          return
        end
      else
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Cannot find the order.")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  include CartConcern
  include UserConcern


  ##
  # For the guest checkout:
  # 1. This function will try to search for any existing temporary user with the same email.
  # 2. If found any, then checkout the order under that user. Otherwise, create a new temporary user to checkout.
  #
  # Potential problems for the guest checkout:
  # 1. When searching for the existing user by email, it is possible to find an irrelevant user. For example, some typos in the email. This is not good because it will mess up a user's order history. Users won't be happy about this and may even worry about the account security. The solution for this is only searching for the temporary users.
  #
  def createOrder(inputParams)
    begin
      zipCode = (inputParams[:zip_code] || "").strip.downcase
      email = (inputParams[:email] || "").strip.downcase
      phone = (inputParams[:phone] || "").strip.downcase

      userId = inputParams[:user_id]
      if userId.present?
        user = User.where(id: userId).first
        if user.blank?
          @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
          @errorMessage = "Cannot find the user."
          return false
        end
      elsif email.present? && phone.present? && zipCode.present?
        user = getTemporaryUserByBindedEmail(email)   # this function is defined in the "UserConcern" module
      else
        @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
        @errorMessage = "Email, phone number, and zip code are required parameters for the guest order."
        return false
      end

      if user.present?
        if email.present?
          unless hasBindedEmailForUser(email, user.id)   # this function is defined in the "UserConcern" module
            addBindedEmailForUser(email, user.id)   # this function is defined in the "UserConcern" module
          end
        end
        if phone.present?
          unless hasBindedPhoneForUser(phone, user.id)   # this function is defined in the "UserConcern" module
            addBindedPhoneForUser(phone, user.id)   # this function is defined in the "UserConcern" module
          end
        end
      else
        user = User.new
        user.is_temporary = true
        user.user_binded_accounts << UserBindedAccount.new(account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:email], account: email)
        user.user_binded_accounts << UserBindedAccount.new(account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:phone], account: phone)
        user.nickname = ["Guest ", email[0, email.index("@")]].join("")
        user.default_zip_code = zipCode
        user.save
      end

      unless user.is_temporary
        userPhone = user.phone || ""
        if user.default_zip_code != zipCode || user.email != email || userPhone != phone
          @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
          @errorMessage = "User profile does not match that on the order."
          return false
        end
      end

      cartEntryDataArray = inputParams[:cart]
      if inputParams[:cart_id].present?
        hasParamCartId = true
        cart = Cart.where(secured_id: inputParams[:cart_id], checked_out: false).first
        if cart.blank?
          @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
          @errorMessage = "Cannot find the shopping cart."
          return false
        end
      else
        hasParamCartId = false
        cart = createCart(cartEntryDataArray)   # this function is defined in the "CartConcern" module
        cart.user = user
      end

      if user.id != cart.user_id
        @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
        @errorMessage = "The shopping cart doesn not belong to the user."
        return false
      end

      cartItemPriceInfoHash = {}
      realTimeStoreItemInfoHash = {}

      if cartEntryDataArray.present? && cartEntryDataArray.length > 0
        cartEntryDataArray.each do |entryData|
          cartItemPriceInfoHash[entryData["item_id"].to_i] = entryData["unit_price"].to_f
        end

        storeHash = getDeliverableStores(zipCode)
        if hasParamCartId
          realTimeStoreItemInfos = getCartRealTimeStoreItemInfos(cart.id, storeHash.keys)   # this function is defined in the "CartConcern" module
        else
          realTimeStoreItemInfos = getRealTimeStoreItemInfos(cartItemPriceInfoHash.keys, storeHash.keys)   # this function is defined in the "CartConcern" module
        end
        realTimeStoreItemInfoHash = convertStoreItemInfoToHash(realTimeStoreItemInfos)   # this function is defined in the "CartConcern" module

        unless isCartItemPriceInfoUpToDate(cartItemPriceInfoHash, realTimeStoreItemInfoHash)
          @errorCode = HaigyManageConstant::Error::ITEM_INFO_OUTDATED
          @errorMessage = "The information in the cart is outdated."
          return false
        end
      else
        @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
        @errorMessage = "The shopping cart is empty."
        return false
      end

      deliveryFee = params[:delivery_fee]
      if deliveryFee.present?
        deliveryFee = deliveryFee.to_f
        if deliveryFee < 0.0 || deliveryFee > HaigyManageConstant::Business::BASIC_DELIVERY_FEE
          deliveryFee = HaigyManageConstant::Business::BASIC_DELIVERY_FEE
        end
      else
        deliveryFee = HaigyManageConstant::Business::BASIC_DELIVERY_FEE
      end

      @order = Order.new(
        is_guest_order: user.is_temporary,
        is_business_address: inputParams[:is_business_address],
        business_name: inputParams[:business_name],
        street_address: inputParams[:street_address],
        city: inputParams[:city],
        state: inputParams[:state],
        zip_code: zipCode,
        email: email,
        phone: phone,
        note: inputParams[:address_note],
        delivery_date: inputParams[:delivery_date],
        delivery_time_slot_start_time: inputParams[:delivery_time_slot_start_time],
        delivery_time_slot_end_time: inputParams[:delivery_time_slot_end_time],
        delivery_fee: deliveryFee
      )
      @order.user = user
      cart.order = @order
      cart.checked_out = true
      cart.checkout_time = Time.now

      @order.is_paid = false
      @order.total_amount_paid = 0.0
      @order.is_stripe_payment = inputParams[:is_stripe_payment] || false
      @order.stripe_token_id = inputParams[:stripe_token_id] || ""

      begin
        ActiveRecord::Base.transaction do
          # update cart entries
          if hasParamCartId
            CartEntry.where(cart_id: cart.id).where.not(item_id: cartItemPriceInfoHash.keys).destroy_all
            cartItemPriceInfoHash.each do |itemId, cartItemUnitPrice|
              realTimeInfo = realTimeStoreItemInfoHash[itemId]
              CartEntry.where(cart_id: cart.id, item_id: itemId).update_all(
                store_id: realTimeInfo.store_id,
                unit_price: cartItemUnitPrice
              )
            end
          else
            cart.cart_entries.each do |cartEntry|
              realTimeInfo = realTimeStoreItemInfoHash[cartEntry.item_id]
              cartEntry.store_id = realTimeInfo.store_id
            end
          end

          if @order.save && cart.save && @order.secureOrder
            Thread.new {
              begin
                OrderMailer.placed(@order).deliver!
              rescue => error
                logger.fatal ["Fail to send order placed email. (", error.message, ")"].join("")
              end
            }
          else
            @errorCode = HaigyManageConstant::Error::CREATE_RECORD_FAILED
            @errorMessage = "Cannot place the order"
            return false
          end
        end

        if userId.blank?
          createNewResponseToken(user)   # create token for the guest user
        end
      rescue => error
        @errorCode = HaigyManageConstant::Error::CREATE_RECORD_FAILED
        @errorMessage = ["Cannot place the order. (", error.message, ")"].join("")
        return false
      end
    rescue => error
      @errorCode = HaigyManageConstant::Error::UNEXPECTED_ERROR
      @errorMessage = "Unknown Error."
      logger.fatal error.message
      return false
    end

    return true
  end


  def isCartItemPriceInfoUpToDate(cartItemPriceInfoHash, realTimeStoreItemInfoHash)
    if cartItemPriceInfoHash.length <= realTimeStoreItemInfoHash.length
      cartItemPriceInfoHash.each do |itemId, cartItemUnitPrice|
        realTimeInfo = realTimeStoreItemInfoHash[itemId]
        if realTimeInfo.present?
          if realTimeInfo.in_stock
            realTimeUnitPrice = realTimeInfo.price
            if realTimeInfo.on_sale
              realTimeUnitPrice = realTimeInfo.sale_price
            end
            if (realTimeUnitPrice - cartItemUnitPrice).abs / realTimeUnitPrice > HaigyClientConstant::Item::OUTDATED_PRICE_TOLERANCE_IN_PERCENTAGE
              return false
            end
          else
            return false
          end
        else
          return false
        end
      end
    else
      return false
    end
    return true
  end


  def addToGuestEmailList(email)
    begin
      Thread.new {
        ActiveRecord::Base.connection_pool.with_connection do
          unless User.exists?(email: email, subscribe_news: true)
            unless GuestEmailList.exists?(email: email)
              GuestEmailList.create(email: email)
            end
          end
        end
      }
    rescue => error
      logger.fatal error.message
    end
  end
end
