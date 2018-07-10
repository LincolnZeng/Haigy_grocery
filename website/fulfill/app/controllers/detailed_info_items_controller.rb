class DetailedInfoItemsController < ApplicationController

  def show
    begin
      @storeHash = getDeliverableStores(params[:zip_code])
      return if @storeHash.nil?   # has unexpected error

      begin
        @item = Item.includes(:item_images).find(params[:id])

        @categoryPath = getDetailedCategoryPath(@item)
        return if @categoryPath.nil?   # has unexpected error

        # currently, for each zip code, each item should be only in one store.
        @storeItemInfo = StoreItemInfo.where(store_id: @storeHash.keys, item_id: @item.id).first
      ensure
        if @item.blank?   # cannot find the item, but it is not an error
          @item = Item.new
          @categoryPath = []
          @storeItemInfo = StoreItemInfo.new
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
      @item = Item.includes(:item_images).find(params[:id])
    rescue => error
      renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, ["Cannot find the item. (", error.message, ")"].join(""))
      return
    end

    begin
      @item.update(substitute_lookup: params[:substitute_lookup])

      @storeHash = getDeliverableStores(params[:zip_code])
      return if @storeHash.nil?   # has unexpected error

      @categoryPath = getDetailedCategoryPath(@item)
      return if @categoryPath.nil?   # has unexpected error

      # currently, for each zip code, each item should be only in one store.
      @storeItemInfo = StoreItemInfo.where(store_id: @storeHash.keys, item_id: @item.id).first
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  include ItemConcern

end
