class FeedMappingsController < ApplicationController
  def index
    begin
      @feedMappings = FeedMapping.where(store_item_info_id: params[:store_item_info_id]).order(:instacart_id)
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def create
    begin
      @feedMapping = FeedMapping.create(feedMappingParams)
    rescue => error
      renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create a feed mapping. (", error.message, ")"].join(""))
      return
    end
  end


  def update
    begin
      @feedMapping = FeedMapping.find(params[:id])
    rescue => error
      renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, ["Cannot find the feed mapping. (", error.message, ")"].join(""))
      return
    end

    begin
      @feedMapping.update(feedMappingParams)
    rescue => error
      renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the feed mapping. (", error.message, ")"].join(""))
      return
    end
  end


  def destroy
    begin
      @feedMapping = FeedMapping.find(params[:id])
    rescue => error
      renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, ["Cannot find the feed mapping. (", error.message, ")"].join(""))
      return
    end

    begin
      @feedMapping.destroy
    rescue => error
      renderError(HaigyManageConstant::Error::DESTROY_RECORD_FAILED, ["Cannot destroy the feed mapping. (", error.message, ")"].join(""))
      return
    end
  end


private
  def feedMappingParams
    params.require(:feed_mapping).permit(:id, :store_item_info_id, :instacart_id)
  end

end
