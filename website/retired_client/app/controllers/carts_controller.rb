class CartsController < ApplicationController
  def create
    begin
      user = getUserFromRequestToken
      return if user.blank?   # Token is invalid

      ActiveRecord::Base.transaction do
        unless getUserCart(user.id, user.default_zip_code)   # this function is defined in the "CartConcern" module
          renderError(@errorCode, @errorMessage)
          return
        end

        @cart.special_requests = params[:special_requests]
        @cart.save
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def update
    begin
      @cart = Cart.find(params[:id])
    rescue => error
      renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, ["Cannot find the cart. (", error.message, ")"].join(""))
      return
    end

    begin
      @cart.update(cartParams)
    rescue => error
      renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the cart. (", error.message, ")"].join(""))
      return
    end
  end


private
  include CartConcern


  def cartParams
    params.require(:cart).permit(:id, :special_requests)
  end


end
