module StoreItemInfoConcern
  extend ActiveSupport::Concern


  # this method must be used in a "ActiveRecord::Base.transaction" block. otherwise, it will cause unpredicted problems.
  # this method will also "updateInStockInfoInStore"
  def addNecessaryCategoryInfoInStore(categoryId, storeId, inStock, outOfStockTime = nil)
    outOfStockSince = outOfStockTime || Time.now
    currentCategoryId = categoryId
    while currentCategoryId != HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID
      if StoreItemInfo.exists?(item_id: currentCategoryId, store_id: storeId)
        break
      else
        category = Item.select(:id, :parent_category_item_id).find(currentCategoryId)
        if category.present?
          StoreItemInfo.create(is_category_item: true, item_id: category.id, store_id: storeId, in_stock: inStock, out_of_stock_since: outOfStockSince)
          currentCategoryId = category.parent_category_item_id
        else
          logger.fatal ["Cannot find the category: ", currentCategoryId].join("")
          return false
        end
      end
    end
    updateInStockInfoInStore(currentCategoryId, storeId)
    return true
  end


  # this method must be used in a "ActiveRecord::Base.transaction" block. otherwise, it will cause unpredicted problems.
  # this method will also "updateInStockInfoInStore"
  def removeEmptyCategoryInfoInStore(categoryId, storeId)
    currentCategoryId = categoryId
    while currentCategoryId != HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID
      itemsInCategory = Item.where(parent_category_item_id: currentCategoryId).pluck(:id)
      if StoreItemInfo.exists?(store_id: storeId, item_id: itemsInCategory)
        break
      else
        StoreItemInfo.where(store_id: storeId, item_id: currentCategoryId).destroy_all

        category = Item.select(:id, :parent_category_item_id).find(currentCategoryId)
        if category.present?
          currentCategoryId = category.parent_category_item_id
        else
          logger.fatal ["Cannot find the category: ", currentCategoryId].join("")
          return false
        end
      end
    end
    updateInStockInfoInStore(currentCategoryId, storeId)
    return true
  end


  # this method must be used in a "ActiveRecord::Base.transaction" block. otherwise, it will cause unpredicted problems.
  # if it is a category, parameters "inStock" and "outOfStockTime" are not used.
  # if it is a category, that in stock or not is determined by its sub items/categories
  # if it is a category and it is out of stock, the out of stock time should use the latest out of stock time of its sub items
  # if it is an item, the parameter "inStock" is required. "outOfStockTime" is optional, default is the current system time.
  def updateInStockInfoInStore(itemId, storeId, inStock = nil, outOfStockTime = nil)
    if itemId == HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID
      return true
    end

    item = Item.select(:id, :is_category, :parent_category_item_id).find(itemId)

    if item.is_category == true
      currentCategoryId = item.id
    else
      outOfStockSince = outOfStockTime || Time.now

      itemInfo = StoreItemInfo.select(:id, :in_stock, :out_of_stock_since, :item_id, :store_id).where(item_id: itemId, store_id: storeId).first
      if item.present? && itemInfo.present?
        if inStock && inStock == true
          itemInfo.update(in_stock: true)
        else
          itemInfo.update(in_stock: false, out_of_stock_since: outOfStockSince)
        end
      else
        logger.fatal ["Cannot find the item (id = ", itemId, ") or the item's store info."].join("")
        return false
      end

      currentCategoryId = item.parent_category_item_id
    end

    while currentCategoryId != HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID
      currentCategory = Item.select(:id, :parent_category_item_id).find(currentCategoryId)
      currentCategoryStoreInfo = StoreItemInfo.select(:id, :in_stock, :out_of_stock_since, :item_id, :store_id).where(item_id: currentCategoryId, store_id: storeId).first

      if currentCategory.present? && currentCategoryStoreInfo.present?
        allItemsInCurrentCategory = Item.where(parent_category_item_id: currentCategoryId).pluck(:id)

        if StoreItemInfo.exists?(item_id: allItemsInCurrentCategory, store_id: storeId, in_stock: true)
          if currentCategoryStoreInfo.in_stock
            break
          else
            currentCategoryStoreInfo.update(in_stock: true)
          end
        else
          allOutofStockItemInfosInCurrentCategory = StoreItemInfo.where(item_id: allItemsInCurrentCategory, store_id: storeId, in_stock: false)
          outOfStockSince = Date.new(2016).to_time
          allOutofStockItemInfosInCurrentCategory.each do |info|
            if info.out_of_stock_since > outOfStockSince
              outOfStockSince = info.out_of_stock_since
            end
          end

          if currentCategoryStoreInfo.in_stock || (!currentCategoryStoreInfo.in_stock && currentCategoryStoreInfo.out_of_stock_since != outOfStockSince)
            currentCategoryStoreInfo.update(in_stock: false, out_of_stock_since: outOfStockSince)
          else
            break
          end
        end
      else
        logger.fatal ["Cannot find the category (id = ", currentCategoryId, ") or the category's store info."].join("")
        return false
      end

      currentCategoryId = currentCategory.parent_category_item_id
    end
    return true
  end

end