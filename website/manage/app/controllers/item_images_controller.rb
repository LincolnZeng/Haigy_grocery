class ItemImagesController < ApplicationController


  def update
    begin
      inputParams = itemImageParams
      @itemImage = ItemImage.where(id: params[:id]).first

      begin
        @itemImage.customer_viewable = inputParams[:customer_viewable]
        @itemImage.save
      rescue => error
        renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the itemImage. (", error.message, ")"].join(""))
        return
      end

    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  def itemImageParams
    params.require(:item_image).permit(
      :id,
      :customer_viewable
    )
  end

end




