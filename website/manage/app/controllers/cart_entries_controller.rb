class CartEntriesController < ApplicationController

  def index
    begin
      @cartEntries = CartEntry.includes(:item).where(cart_id: params[:cart_id])
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end

  def update
    begin
      @cartEntry = CartEntry.includes(:item).find(params[:id])
      if @cartEntry.present?
        @cartEntry.update(cartEntryParams)
      else
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the cart entry.")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end

private
  def cartEntryParams
    params.require(:cart_entry).permit(
      :id,
      :cart_id,
      :item_id,
      :quantity,
      :unit_price
    )
  end

end
