class CartsController < ApplicationController

  def update
    begin
      @cart = Cart.where(id: params[:id]).first
      if @cart.present?
        if @cart.secured_id.blank?
          @cart.secureCart
        end
      else
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the cart entry.")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def show
    begin
      @cart = Cart.where(id: params[:id]).first
      if @cart.present?
        @user = User.find(@cart.user_id)
        unless getUserCart(@user.id, @user.default_zip_code)   # this function is defined in the "CartConcern" module
          renderError(@errorCode, @errorMessage)
          return
        end
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
  include CartConcern

end
