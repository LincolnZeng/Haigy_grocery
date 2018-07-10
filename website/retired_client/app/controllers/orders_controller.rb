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

      createOrderSuccess = false
      isGuestOrder = (params[:is_guest_order] == true)

      if isGuestOrder
        createOrderSuccess = createGuestOrder(params)
      else
        createOrderSuccess = createUserOrder(params)
      end

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
          if @order.email == (params[:email] || "").strip.downcase
            if @order.status == HaigyManageConstant::Order::STATUS[:delivered]
              if @order.expire_time.blank? || @order.expire_time < Time.now
                renderError(HaigyManageConstant::Error::NOT_ALLOWED, "This guest order is no longer viewable.")
                return
              end
            end
          else
            renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "The email is not correct.")
            return
          end
        else
          user = getUserFromRequestToken
          if @order.user_id != user.id
            renderError(HaigyManageConstant::Error::NOT_ALLOWED, "This order does not belong to the user currently signed in.")
            return
          end
        end

        @cart = Cart.where(id: @order.cart_id).first
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


  def createGuestOrder(inputParams)
    begin
      zipCode = (inputParams[:zip_code] || "").strip.downcase
      email = (inputParams[:email] || "").strip.downcase

      if inputParams[:subscribe_news] == true
        addToGuestEmailList(email)
      end

      @order = Order.new(
        is_guest_order: true,
        is_business_address: inputParams[:is_business_address],
        business_name: inputParams[:business_name],
        street_address: inputParams[:street_address],
        city: inputParams[:city],
        state: inputParams[:state],
        zip_code: zipCode,
        email: email,
        phone: inputParams[:phone],
        note: inputParams[:note],
        delivery_date: inputParams[:delivery_date],
        delivery_time_slot_start_time: inputParams[:delivery_time_slot_start_time],
        delivery_time_slot_end_time: inputParams[:delivery_time_slot_end_time],
        delivery_fee: HaigyManageConstant::Business::DELIVERY_FEE
      )
      @order.secureOrder(true)

      # guest shopping cart
      cartEntryDataArray = inputParams[:cart]
      specialRequests = params[:special_requests]

      validatedZipCode = ServableZipCode.where(zip_code: zipCode).first
      if validatedZipCode.present?
        if cartEntryDataArray.present?
          cartItemPriceInfoHash = {}
          allCartItemId = []
          allCartStoreId = []
          cartEntryDataArray.each do |entryData|
            cartItemPriceInfoHash[entryData["item_id"].to_i] = entryData["unit_price"].to_f
            allCartItemId << entryData["item_id"]
            allCartStoreId << entryData["store_id"]
          end

          realTimeStoreItemInfos = getRealTimeStoreItemInfos(allCartItemId, allCartStoreId)   # this function is defined in the "CartConcern" module
          realTimeStoreItemInfoHash = convertStoreItemInfoToHash(realTimeStoreItemInfos)   # this function is defined in the "CartConcern" module

          unless isCartItemPriceInfoUpToDate(cartItemPriceInfoHash, realTimeStoreItemInfoHash)
            @errorCode = HaigyManageConstant::Error::ITEM_INFO_OUTDATED
            @errorMessage = "The information in the cart is outdated."
            return false
          end
        elsif specialRequests.blank? || specialRequests.length < 21   # a nonempty special request json string should have at least these 21 characters: [{id summary quantity}]
          @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
          @errorMessage = "Shopping cart is empty."
          return false
        end
      else
        @errorCode = HaigyManageConstant::Error::ZIPCODE_NOT_SERVABLE
        @errorMessage = ["Zip code, ", zipCode, " is not in our service area."].join("")
        return false
      end

      cart = createCart(cartEntryDataArray, params[:special_requests], validatedZipCode.id)   # this function is defined in the "CartConcern" module
      if cart.present?
        cart.checked_out = true
        cart.checkout_time = Time.now
        @order.cart = cart
      end

      begin
        if @order.save
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


  def createUserOrder(inputParams)
    begin
      zipCode = (inputParams[:zip_code] || "").strip.downcase
      email = (inputParams[:email] || "").strip.downcase

      user = User.find(inputParams[:user_id])
      if user.blank?
        @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
        @errorMessage = "Cannot find the user."
        return false
      end

      cart = Cart.find(inputParams[:cart_id])
      if cart.blank?
        @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
        @errorMessage = "Cannot find the shopping cart."
        return false
      end

      if user.id != cart.user_id
        @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
        @errorMessage = "The shopping cart doesn not belong to the user."
        return false
      end

      cartEntryDataArray = inputParams[:cart]
      realTimeStoreItemInfoHash = {}

      if cartEntryDataArray.present?
        cartItemPriceInfoHash = {}
        cartEntryDataArray.each do |entryData|
          cartItemPriceInfoHash[entryData["item_id"].to_i] = entryData["unit_price"].to_f
        end

        realTimeStoreItemInfos = getCartRealTimeStoreItemInfos(cart.id)   # this function is defined in the "CartConcern" module
        realTimeStoreItemInfoHash = convertStoreItemInfoToHash(realTimeStoreItemInfos)   # this function is defined in the "CartConcern" module

        unless isCartItemPriceInfoUpToDate(cartItemPriceInfoHash, realTimeStoreItemInfoHash)
          @errorCode = HaigyManageConstant::Error::ITEM_INFO_OUTDATED
          @errorMessage = "The information in the cart is outdated."
          return false
        end
      elsif cart.special_requests.blank? && cart.special_requests.length < 21   # a nonempty special request json string should have at least these 21 characters: [{id summary quantity}]
        @errorCode = HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT
        @errorMessage = "The cart is empty."
        return false
      end

      @order = Order.new(
        is_guest_order: false,
        is_business_address: inputParams[:is_business_address],
        business_name: inputParams[:business_name],
        street_address: inputParams[:street_address],
        city: inputParams[:city],
        state: inputParams[:state],
        zip_code: zipCode,
        email: email,
        phone: inputParams[:phone],
        note: inputParams[:note],
        delivery_date: inputParams[:delivery_date],
        delivery_time_slot_start_time: inputParams[:delivery_time_slot_start_time],
        delivery_time_slot_end_time: inputParams[:delivery_time_slot_end_time],
        delivery_fee: HaigyManageConstant::Business::DELIVERY_FEE
      )
      @order.user = user
      @order.cart = cart
      @order.secureOrder(false)
      cart.checked_out = true
      cart.checkout_time = Time.now

      begin
        ActiveRecord::Base.transaction do
          # update cart entries
          CartEntry.where(cart_id: cart.id).where.not(item_id: realTimeStoreItemInfoHash.keys).destroy_all
          realTimeStoreItemInfoHash.each do |itemId, info|
            if info.in_stock
              CartEntry.where(cart_id: cart.id, item_id: itemId).update_all(
                store_id: info.store_id,
                unit_price: (info.on_sale ? info.sale_price : info.price)
              )
            else
              CartEntry.where(cart_id: cart.id, item_id: itemId).destroy_all()
            end
          end

          if @order.save && cart.save
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
    if realTimeStoreItemInfoHash.length == cartItemPriceInfoHash.length
      realTimeStoreItemInfoHash.each do |itemId, realTimeInfo|
        if realTimeInfo.in_stock
          cartItemUnitPrice = cartItemPriceInfoHash[itemId]
          if cartItemUnitPrice.present?
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
