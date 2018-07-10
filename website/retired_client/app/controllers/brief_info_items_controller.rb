class BriefInfoItemsController < ApplicationController

  def marketing
    begin
      @storeHash = getDeliverableStores(params[:zip_code])
      return if @storeHash.nil?   # has unexpected error

      @items = []
      haigyStores = []
      wholeFoodsMarketStores = []
      @storeHash.each do |storeId, store|
        case store.company_id
        when HaigyManageConstant::Company::HAIGY_ID
          haigyStores << storeId
        when HaigyManageConstant::Company::WHOLE_FOODS_MARKET_ID
          wholeFoodsMarketStores << storeId
        end
      end

      fruitCategoryId = Item.where(name: "Fruits", is_category: true).pluck(:id).first
      if fruitCategoryId.present?
        onSaleFruits = Item.includes(:store_item_infos)
          .where(is_category: false)
          .where(store_item_infos: {in_stock: true, on_sale: true, store_id: haigyStores})
          .where("parent_category_path like ?", "#{fruitCategoryId}%").limit(140)
        @items.concat(onSaleFruits.to_a.sample(7))
      end

      vegetableCategoryId = Item.where(name: "Vegetables", is_category: true).pluck(:id).first
      if vegetableCategoryId.present?
        vegetableCount = 10 - @items.length
        onSaleVegetables = Item.includes(:store_item_infos)
          .where(is_category: false)
          .where(store_item_infos: {in_stock: true, on_sale: true, store_id: haigyStores})
          .where("parent_category_path like ?", "#{vegetableCategoryId}%").limit(vegetableCount * 20)
        @items.concat(onSaleVegetables.to_a.sample(vegetableCount))
      end

      wfmItemCount = 15 - @items.length
      wholeFoodsMarketOnSaleItems = Item.includes(:store_item_infos)
        .where(is_category: false)
        .where(store_item_infos: {in_stock: true, on_sale: true, store_id: wholeFoodsMarketStores})
        .limit(wfmItemCount * 20)
      @items.concat(wholeFoodsMarketOnSaleItems.to_a.sample(wfmItemCount))

      snackCategoryId = Item.where(name: "Delicious Imported Snacks", is_category: true).pluck(:id).first
      if snackCategoryId.present?
        snackCount = 20 - @items.length
        onSaleSnacks = Item.includes(:store_item_infos)
          .where(is_category: false)
          .where(store_item_infos: {in_stock: true, on_sale: true, store_id: haigyStores})
          .where("parent_category_path like ?", "#{snackCategoryId}%").limit(snackCount * 20)
        @items.concat(onSaleSnacks.to_a.sample(snackCount))
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def browse
    begin
      @storeHash = getDeliverableStores(params[:zip_code])
      return if @storeHash.nil?   # has unexpected error

      @hasMoreToLoad = false
      load = (params[:load] || 0).to_i
      if load == 1
        @items = Item.includes(:store_item_infos)
          .where(store_item_infos: {store_id: @storeHash.keys})
          .where(parent_category_item_id: params[:parent_category_item_id])
          .limit(HaigyClientConstant::Item::MAX_BROWSE_ITEM_COUNT_ON_FIRST_LOAD)
          .order(:display_sequence, :name)

        if @items.length >= HaigyClientConstant::Item::MAX_BROWSE_ITEM_COUNT_ON_FIRST_LOAD
          @hasMoreToLoad = true
        end
      elsif load == 2
        @items = Item.includes(:store_item_infos)
          .where(store_item_infos: {store_id: @storeHash.keys})
          .where(parent_category_item_id: params[:parent_category_item_id])
          .offset(HaigyClientConstant::Item::MAX_BROWSE_ITEM_COUNT_ON_FIRST_LOAD)
          .limit(1000000000)   # a hack for using "offset" in this query. it should be a Rails bug
          .order(:display_sequence, :name)
      else
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Invalid parameter: \"load\"")
        return
      end

      if @items[0].present?
        @categoryPath = getDetailedCategoryPath(@items[0])
        return if @categoryPath.nil?   # has unexpected error
      else
        begin
          parentCategory = Item.select(:id, :name, :is_category, :parent_category_path, :parent_category_item_id).find(params[:parent_category_item_id])
        ensure
          if parentCategory.blank? || !parentCategory.is_category   # cannot find the parent category, but it is not an error
            @categoryPath = []
            return
          end
        end

        @categoryPath = getDetailedCategoryPath(parentCategory)
        return if @categoryPath.nil?   # has unexpected error

        @categoryPath.push({id: parentCategory.id, name: parentCategory.name})
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def search
    begin
      @storeHash = getDeliverableStores(params[:zip_code])
      return if @storeHash.nil?   # has unexpected error

      keyword = params[:keyword]
      page = begin params[:page].to_i rescue 1 end
      page = 1 if page < 1

      if keyword.present?
        itemSearchResults = Item.search_ids do
          fulltext params[:keyword] do
            boost_fields(name: 3.0)
            phrase_fields(name: 2.0, search_keywords: 2.0)
          end
          with :is_category, false
          paginate :page => page, :per_page => HaigyClientConstant::Item::SEARCH_COUNT_PER_PAGE
        end
      else
        itemSearchResults = []
      end

      @hasMoreToLoad = itemSearchResults.length >= HaigyClientConstant::Item::SEARCH_COUNT_PER_PAGE

      @categoryPath = [
        {id: HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID, name: "Home"},
        {id: nil, name: ["search for: \"", keyword, "\""].join("")}
      ]

      searchedItems = Item.includes(:store_item_infos)
        .where(store_item_infos: {store_id: @storeHash.keys, in_stock: true})
        .where(id: itemSearchResults)

      hashedItems = {}
      searchedItems.each do |item|
        hashedItems[item.id] = item
      end

      @items = []
      itemSearchResults.each do |itemId|
        item = hashedItems[itemId]
        unless item.nil?
          @items << item
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def show
    begin
      @storeHash = getDeliverableStores(params[:zip_code])
      return if @storeHash.nil?   # has unexpected error

      begin
        @item = Item.includes(:store_item_infos).find(params[:id])
      rescue
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the item.")
        return
      end

      @storeItemInfo = StoreItemInfo.where(item_id: @item.id, store_id: @storeHash.keys).first
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  include ItemConcern


end
