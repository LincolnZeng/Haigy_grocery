class ItemsController < ApplicationController
  respond_to :json


  def create
    begin
      inputParams = itemParams

      begin
        otherImageParams = inputParams[:item_image]
        inputParams.delete(:item_image)

        barcodeParam = inputParams[:barcode]
        barcodeTypeParam = inputParams[:barcode_type]
        inputParams.delete(:barcode)
        inputParams.delete(:barcode_type)

        itemKeywords = (inputParams[:item_keywords] || "").strip.downcase
        inputParams.delete(:item_keywords)

        @item = Item.new(inputParams)
        @item.item_keywords = itemKeywords

        parentCategoryId = inputParams[:parent_category_item_id].to_i
        if parentCategoryId == HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID
          @item.parent_category_path = ""
          @item.tier_in_category_path = 1
        else
          begin
            parentItem = Item.find(parentCategoryId)
            if parentItem.is_category
              @item.parent_category_path = parentItem.getItemPath
              @item.tier_in_category_path = parentItem.tier_in_category_path + 1
            else
              parentItem = nil
            end
          ensure
            if parentItem.blank?
              renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the parent category.")
              return
            end
          end
        end

        if !@item.is_category && otherImageParams.present?
          otherImageParams.each do |paramkey, paramValue|
            otherImage = ItemImage.new(paramValue)
            @item.item_images << otherImage
          end
        end

        if barcodeParam.present?
          if barcodeTypeParam.present?
            barcode = Barcode.new(code: barcodeParam, code_type: barcodeTypeParam)
          else
            barcode = Barcode.new(code: barcodeParam)
          end
          @item.barcodes << barcode
        end
      rescue => error
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, ["Request parameters are not correct. (", error.message, ")"].join(""))
        return
      end

      begin
        ActiveRecord::Base.transaction do
          updateItemSearchKeyword(@item)
        end
      rescue => error
        renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create the item. (", error.message, ")"].join(""))
        return
      end

      @categoryPath = getDetailedCategoryPath(@item)
      return if @categoryPath.nil?   # has unexpected error
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def update
    begin
      inputParams = itemParams

      begin
        @item = Item.includes(:barcodes, :item_images).find(params[:id])
      ensure
        if @item.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the item or category.")
          return
        end
      end

      parentCategoryId = @item.parent_category_item_id
      if inputParams[:parent_category_item_id].present?
        parentCategoryId = inputParams[:parent_category_item_id].to_i
      end

      if parentCategoryId == @item.parent_category_item_id   # regular update

        begin
          barcodeParam = inputParams[:barcode]
          barcodeTypeParam = inputParams[:barcode_type]
          barcodesToDeleleParams = inputParams[:delete_barcode]
          otherImageParams = inputParams[:item_image]
          imagesToDeleleParams = inputParams[:delete_image]
          inputParams.delete(:barcode)
          inputParams.delete(:barcode_type)
          inputParams.delete(:delete_barcode)
          inputParams.delete(:item_image)
          inputParams.delete(:delete_image)
          inputParams.delete(:is_category)

          ActiveRecord::Base.transaction do
            if !@item.is_category
              if barcodesToDeleleParams.present?
                barcodesToDelele = Barcode.where(id: barcodesToDeleleParams.split(","))
                @item.barcodes.destroy(barcodesToDelele)
              end

              if barcodeParam.present?
                if barcodeTypeParam.present?
                  barcode = Barcode.new(code: barcodeParam, code_type: barcodeTypeParam)
                else
                  barcode = Barcode.new(code: barcodeParam)
                end
                @item.barcodes << barcode
              end

              if imagesToDeleleParams.present?
                imagesToDelele = ItemImage.where(id: imagesToDeleleParams.split(","))
                @item.item_images.destroy(imagesToDelele)
              end

              if otherImageParams.present?
                otherImageParams.each do |paramkey, paramValue|
                  otherImage = ItemImage.new(paramValue)
                  @item.item_images << otherImage
                end
              end
            end

            if inputParams[:item_keywords].nil?
              @item.update(inputParams)
            else
              itemKeywords = inputParams[:item_keywords].strip.downcase
              inputParams.delete(:item_keywords)
              if itemKeywords == @item.item_keywords
                @item.update(inputParams)
              else
                @item.assign_attributes(inputParams)
                @item.item_keywords = itemKeywords
                updateItemSearchKeyword(@item)
              end
            end
          end
        rescue => error
          renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the item. (", error.message, ")"].join(""))
          return
        end

      else   # move the item to another category

        moveItem(parentCategoryId)

      end

      @categoryPath = getDetailedCategoryPath(@item)
      return if @categoryPath.nil?   # has unexpected error
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def show
    begin
      begin
        @item = Item.includes(:barcodes, :item_images).find(params[:id])

        @categoryPath = getDetailedCategoryPath(@item)
        return if @categoryPath.nil?   # has unexpected error
      ensure
        if @item.blank?   # cannot find the item, but it is not an error
          @item = Item.new
          @categoryPath = []
          return
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def manage
    begin
      @items = Item.includes(store_item_infos: :feed_mappings)
        .where(parent_category_item_id: params[:parent_category_item_id])
        .order(:display_sequence, :name)

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
      if params[:barcode].present?
        @items = Item.includes(:barcodes).where(barcodes: {code: params[:barcode]}, is_category: false)
      elsif params[:name].present?
        itemSearch = Item.search do
          fulltext params[:name] do
            phrase_fields :name => 2.0
          end
          with :is_category, false
        end
        @items = itemSearch.results
      else
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Miss request parameters \":barcode\" or \":name\".")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def fedButStarving
    begin
      allItemIds = StoreItemInfo.select(:item_id).distinct
        .joins("INNER JOIN feed_mappings ON store_item_infos.id = feed_mappings.store_item_info_id")
        .where(is_category_item: false, in_stock: true)
        .where("store_item_infos.updated_at < ?", Time.now.since(-3.days))
        .pluck(:item_id)

      @items = Item.includes(store_item_infos: :feed_mappings)
        .where(id: allItemIds)
        .order(:display_sequence, :name)
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def destroy
    begin
      begin
        @item = Item.find(params[:id])
      ensure
        if @item.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the item.")
          return
        end
      end

      begin
        @item.destroy
      rescue => error
        renderError(HaigyManageConstant::Error::DESTROY_RECORD_FAILED, ["Cannot destroy the item. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  include StoreItemInfoConcern


  def itemParams
    params.require(:item).permit(
      :id,
      :name,
      :item_keywords,
      :display_sequence,
      :is_category,
      :parent_category_item_id,
      :cover_image,
      :temporary_cover_image,
      :unit,
      :item_size,
      :brand,
      :manufacturer,
      :details,
      :ingredients,
      :warnings,
      :directions,
      :nutrition_facts,

      :is_organic,
      :is_kosher,
      :is_vegan,
      :is_gluten_free,
      :is_dairy_free,
      :is_egg_free,
      :is_lactose_free,
      :is_produce,
      :is_seasonal,

      :barcode,
      :barcode_type,
      :delete_barcode,
      :delete_image,
      item_image: [:image]
    )
  end


  def getDetailedCategoryPath(item)
    begin
      if item.parent_category_item_id == HaigyManageConstant::Item::DEFAULT_PARENT_CATEGORY_ITEM_ID
        return []
      else
        allCategories = [{id: HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID, name: "Root"}]

        allCategoryIds = item.getAllCategoryIds
        categoryPathHash = {}

        Item.select(:id, :name).find(allCategoryIds).each do |category|
          categoryPathHash[category.id.to_s] = {id: category.id, name: category.name}
        end

        allCategoryIds.each do |categoryId|
          allCategories.push(categoryPathHash[categoryId])
        end

        return allCategories
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, ["Unable to get detailed category path. (", error.message, ")"].join(""))
      return nil
    end
  end


  def moveItem(newParentCategoryId)
    begin
      ActiveRecord::Base.transaction do
        if newParentCategoryId == HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID
          @item.parent_category_path = ""
          @item.tier_in_category_path = 1
        else
          parentItem = Item.find(newParentCategoryId)
          if parentItem.is_category
            @item.parent_category_path = parentItem.getItemPath
            @item.tier_in_category_path = parentItem.tier_in_category_path + 1
          else
            raise "Cannot find the new parent category."
            return
          end
        end

        oldParentCategoryId = @item.parent_category_item_id
        @item.parent_category_item_id = newParentCategoryId
        @item.save

        allStoreId = StoreItemInfo.where(item_id: @item.id).pluck(:store_id)
        allStoreId.each do |storeId|
          storeInfo = StoreItemInfo.where(item_id: @item.id, store_id: storeId).first
          if storeInfo.present?
            # "addNecessaryCategoryInfoInStore" is defined in "StoreItemInfoConcern"
            unless addNecessaryCategoryInfoInStore(@item.parent_category_item_id, storeId, storeInfo.in_stock, storeInfo.out_of_stock_since)
              raise "Fail to add necessary category infos in the store."
            end
          end
        end

        allItemsInOldCategory = Item.where(parent_category_item_id: oldParentCategoryId).pluck(:id)
        allOldCatgoryInfos = StoreItemInfo.where(item_id: oldParentCategoryId)
        allOldCatgoryInfos.each do |info|
          if StoreItemInfo.exists?(item_id: allItemsInOldCategory, store_id: info.store_id)
            # "updateInStockInfoInStore" is defined in "StoreItemInfoConcern"
            unless updateInStockInfoInStore(info.item_id, info.store_id)
              raise "Fail to update item in stock information in the store."
            end
          else
            # "removeEmptyCategoryInfoInStore" is defined in "StoreItemInfoConcern"
            unless removeEmptyCategoryInfoInStore(info.item_id, info.store_id)
              raise "Fail to remove empty cateogries in the store."
            end
          end
        end

        itemQueue = Queue.new
        itemQueue.push(@item)

        while !itemQueue.empty?
          nextItem = itemQueue.pop(true)
          childrenItems = Item.where(parent_category_item_id: nextItem.id)
          caetgoryPath = nextItem.getItemPath
          childrenItems.update_all({
            parent_category_path: caetgoryPath,
            tier_in_category_path: nextItem.tier_in_category_path + 1
          })

          childrenItems.each do |childItem|
            if childItem.is_category
              itemQueue.push(childItem)
            end
          end
        end

        updateItemSearchKeyword(@item)
      end
    rescue => error
      raise ["Cannot move the item. (", error.message, ")"].join("")
    end
  end


  # this method must be used in a "ActiveRecord::Base.transaction" block
  def updateItemSearchKeyword(item)
    parentSearchKeywords = ""
    if item.parent_category_item_id != HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID && item.parent_category_item_id != HaigyManageConstant::Item::DEFAULT_PARENT_CATEGORY_ITEM_ID
      parentItem = Item.find(item.parent_category_item_id)
      parentSearchKeywords = parentItem.search_keywords
    end
    item.search_keywords = [parentSearchKeywords, item.item_keywords].join(" ").strip
    item.save

    itemQueue = Queue.new
    itemQueue.push(item)

    while !itemQueue.empty?
      nextItem = itemQueue.pop(true)
      childrenItems = Item.where(parent_category_item_id: nextItem.id)
      parentSearchKeywords = nextItem.search_keywords

      childrenItems.each do |childItem|
        childItem.update(
          search_keywords: [parentSearchKeywords, childItem.item_keywords].join(" ").strip
        )

        if childItem.is_category
          itemQueue.push(childItem)
        end
      end
    end
  end

end
