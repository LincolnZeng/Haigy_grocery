class StoreItemInfosController < ApplicationController
  before_filter :validateToken, except: [:updateFromHaigyProduceGrab]


  def show
    begin
      begin
        @info = StoreItemInfo.includes({store: :company}, :item).find(params[:id])
      ensure
        if @info.blank?   # cannot find the store item info, but it is not an error
          @info = createEmptyStoreiteminfo
          return
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def byItem
    begin
      @infos = StoreItemInfo.includes({store: :company}, :item, :feed_mappings).where(item_id: params[:item_id])
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def byStoreAndItem
    begin
      begin
        @infos = StoreItemInfo.includes({store: :company}, :item).where(store_id: params[:store_id], item_id: params[:item_id])
      ensure
        if @infos.blank?
          store = Store.includes(:company).find(params[:store_id])
          item = Item.find(params[:item_id])

          if store.blank? || item.blank?   # cannot find the store or item, but it is not an error
            info = createEmptyStoreiteminfo
            @infos = [info]
            return
          else
            info = StoreItemInfo.new
            info.store = store
            info.item = item
            @infos = [info]
            return
          end
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def create
    begin
      ActiveRecord::Base.transaction do
        inputParams = storeItemInfoParams
        store = Store.find(inputParams[:store_id])
        item = Item.find(inputParams[:item_id])
        if store.present? && item.present?
          @info = StoreItemInfo.new(inputParams)
          @info.is_category_item = false
          @info.store = store
          @info.item = item

          # force the price to be ceiled to the cent digit
          @info.price = (@info.price * 100.0).ceil / 100.0
          @info.sale_price = (@info.sale_price * 100.0).ceil / 100.0

          # automatically add the category info for the item in the store
          # "addNecessaryCategoryInfoInStore" is defined in "StoreItemInfoConcern"
          unless addNecessaryCategoryInfoInStore(item.parent_category_item_id, store.id, @info.in_stock, @info.out_of_stock_since)   # has unexpected error
            raise "Fail to add necessary category infos in the store."
          end
        else
          renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Request parameters are not correct. Cannot find the item or the store.")
          return
        end

        begin
          @info.save
        rescue => error
          renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create the store item info. (", error.message, ")"].join(""))
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
      begin
        @info = StoreItemInfo.includes({store: :company}, :item).find(params[:id])
      ensure
        if @info.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the store item info.")
          return
        elsif @info.store.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the store for the store item info.")
          return
        elsif @info.item.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the item for the store item info.")
          return
        end
      end

      inputParams = storeItemInfoParams

      # shouldn't change these two references in the "update"
      inputParams.delete(:store_id)
      inputParams.delete(:item_id)

      begin
        ActiveRecord::Base.transaction do
          inStock = @info.in_stock
          @info.assign_attributes(inputParams)
          if !@info.in_stock && @info.in_stock != inStock
            @info.out_of_stock_since = Time.now
          end

          # force the price to be ceiled to the cent digit
          @info.price = (@info.price * 100.0).ceil / 100.0
          @info.sale_price = (@info.sale_price * 100.0).ceil / 100.0

          @info.save

          # "updateInStockInfoInStore" is defined in "StoreItemInfoConcern"
          # also update item category infos in the store
          if @info.item.parent_category_item_id != HaigyManageConstant::Item::DEFAULT_PARENT_CATEGORY_ITEM_ID
            unless updateInStockInfoInStore(@info.item.parent_category_item_id, @info.store_id)   # has unexpected error
              raise "Fail to update necessary category infos in the store."
            end
          end
        end
      rescue => error
        renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the store item info. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  # TODO: make this functionality better and easier to extend and maintain
  def updateFromHaigyProduceGrab
    @itemId = nil
    @success = "no"
    allStores = Store.where(company_id: HaigyManageConstant::Company::HAIGY_ID)

    # a temporary security solution
    key = begin params[:key].to_s rescue "" end
    if key != "jkfnlaewnofaoehdjcv32rfdkc-02mr3fdfsmf301femwecpzfepomvdlfmwdasfecz2421442385"
      @errorMessage = "Not allowed"
      return
    end

    itemName = begin params[:item_name].to_s rescue "" end
    inStock = begin params[:in_stock].to_s rescue "" end
    purchaseUnit = begin params[:purchase_unit].to_s rescue "" end
    price = begin params[:price].to_f * (1.0 + HaigyManageConstant::Item::PRODUCE_PRICE_MARKUP_RATIO) rescue 0.0 end
    estimatedWeight = begin params[:estimated_weight_of_each_in_lb].to_f rescue 0.0 end
    isOrganic = begin params[:is_organic].to_s rescue "" end
    isSeasonal = begin params[:is_seasonal].to_s rescue "" end

    if itemName.blank?
      @errorMessage = "The value of the parameter, item_name, is not correct."
      return
    end
    if inStock != "yes" && inStock != "no"
      @errorMessage = "The value of the parameter, in_stock, is not correct."
      return
    end
    if purchaseUnit.blank?
      @errorMessage = "The value of the parameter, purchase_unit, is not correct."
      return
    end
    unless price > 0.0
      @errorMessage = "The value of the parameter, price, is not correct."
      return
    end
    unless estimatedWeight > 0.0
      @errorMessage = "The value of the parameter, estimated_weight_of_each_in_lb, is not correct."
      return
    end
    if isOrganic != "yes" && isOrganic != "no"
      @errorMessage = "The value of the parameter, is_organic, is not correct."
      return
    end
    if isSeasonal != "yes" && isSeasonal != "no"
      @errorMessage = "The value of the parameter, is_seasonal, is not correct."
      return
    end

    if purchaseUnit == HaigyManageConstant::Item::PURCHASE_UNIT[:per_lb]
      purchaseUnit = HaigyManageConstant::Item::PURCHASE_UNIT[:each]   # for a new item. the default unit for a new produce item is "each". if other unit is needed, please manually change it.
      pricePerLb = price
      priceEach = price * estimatedWeight
    else
      pricePerLb = price / estimatedWeight
      priceEach = price
    end

    itemName = itemName.titleize
    item = Item.where(id: params[:item_id]).first
    if item.blank?
      sameNameItems = Item.where(name: itemName, is_category: false)
      if sameNameItems.length == 1
        item = sameNameItems.first
      elsif sameNameItems.length > 1
        @errorMessage = "Found more than one item in the database with this item name."
        return
      end
    end

    if item.present?
      @itemId = item.id
      if item.name != itemName
        @errorMessage = ["Cannot change the item name from here. The item name in the database is: ", item.name].join("")
        return
      end
      if item.is_organic != (isOrganic == "yes")
        @errorMessage = "Cannot change the item attribute, is_organic, from here."
        return
      end
      if item.is_seasonal != (isSeasonal == "yes")
        @errorMessage = "Cannot change the item attribute, is_seasonal, from here."
        return
      end

      ActiveRecord::Base.transaction do
        allStores.each do |store|
          itemInfo = StoreItemInfo.where(item_id: item.id, store_id: store.id).first

          if inStock == "yes"
            itemInfo.in_stock = true
          else
            itemInfo.in_stock = false
            itemInfo.out_of_stock_since = Time.now
          end

          if item.unit == HaigyManageConstant::Item::PURCHASE_UNIT[:per_lb]
            price = pricePerLb
          else
            price = priceEach
          end

          if price < itemInfo.price
            itemInfo.on_sale = true
            if price < itemInfo.sale_price
              itemInfo.price = itemInfo.sale_price
            end
            itemInfo.sale_price = price
          else
            itemInfo.on_sale = false
            itemInfo.sale_price = price
            itemInfo.price = price
          end

          itemInfo.estimated_weight_of_each_in_lb = estimatedWeight

          # force the price to be ceiled to the cent digit
          itemInfo.price = (itemInfo.price * 100.0).ceil / 100.0
          itemInfo.sale_price = (itemInfo.sale_price * 100.0).ceil / 100.0

          itemInfo.save

          # "updateInStockInfoInStore" is defined in "StoreItemInfoConcern"
          # also update item category infos in the store
          if item.parent_category_item_id != HaigyManageConstant::Item::DEFAULT_PARENT_CATEGORY_ITEM_ID
            unless updateInStockInfoInStore(item.parent_category_item_id, itemInfo.store_id)   # has unexpected error
              raise "Fail to update necessary category infos in the store."
            end
          end
        end

        @success = "yes"
      end
    else
      ActiveRecord::Base.transaction do
        newItem = Item.create(
          name: itemName,
          is_category: false,
          parent_category_item_id: HaigyManageConstant::Item::DEFAULT_PARENT_CATEGORY_ITEM_ID,
          has_fixed_item_size: false,
          unit: purchaseUnit,
          cover_image: File.open(Rails.root.join("resource", "image", "unknown.jpg")),
          temporary_cover_image: true,
          is_produce: true,
          is_seasonal: (isSeasonal == "yes"),
          is_organic: (isOrganic == "yes")
        )
        @itemId = newItem.id

        # force the price to be ceiled to the cent digit
        priceEach = (priceEach * 100.0).ceil / 100.0

        allStores.each do |store|
          StoreItemInfo.create(
            item_id: @itemId,
            store_id: store.id,
            is_category_item: false,
            estimated_weight_of_each_in_lb: estimatedWeight,
            price: priceEach,
            sale_price: priceEach,
            on_sale: false,
            in_stock: (inStock == "yes"),
            out_of_stock_since: Time.now
          )
        end

        @success = "yes"
      end
    end
  end


  def destroy
    begin
      ActiveRecord::Base.transaction do
        begin
          @info = StoreItemInfo.includes({store: :company}, :item).find(params[:id])
        ensure
          if @info.blank?
            renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the store item info.")
            return
          end
        end

        begin
          @info.destroy
        rescue => error
          renderError(HaigyManageConstant::Error::DESTROY_RECORD_FAILED, ["Cannot destroy the store item info. (", error.message, ")"].join(""))
          return
        end

        # automatically remove empty category infos
        # "removeEmptyCategoryInfoInStore" is defined in "StoreItemInfoConcern"
        unless removeEmptyCategoryInfoInStore(@info.item.parent_category_item_id, @info.store.id)   # has unexpected error
          raise "Fail to remove empty category infos in the store."
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  include StoreItemInfoConcern


  def storeItemInfoParams
    params.require(:store_item_info).permit(
      :id,
      :price,
      :sale_price,
      :on_sale,
      :quantity,
      :in_stock,
      :note,
      :store_id,
      :item_id,
      :estimated_weight_of_each_in_lb
    )
  end


  def createEmptyStoreiteminfo
    info = StoreItemInfo.new
    company = Company.new
    store = Store.new
    item = Item.new
    store.company = company
    info.store = store
    info.item = item
    return info
  end

end
