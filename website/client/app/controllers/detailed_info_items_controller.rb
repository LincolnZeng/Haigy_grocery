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


private
  include ItemConcern

end
