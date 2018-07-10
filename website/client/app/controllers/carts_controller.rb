class CartsController < ApplicationController

  def show
    begin
      @cart = Cart.where(secured_id: params[:id]).first

      if @cart.present?
        @user = User.find(@cart.user_id)

        requestedUser = getUserFromRequestToken(true)
        if requestedUser.blank? || requestedUser.id != @user.id
          if @user.is_temporary
            createNewResponseToken(@user)
          else
            renderError(HaigyManageConstant::Error::AUTHENTICATION_FAILED, "No permission to see this cart.")
            return
          end
        end

        @defaultAddress = UserAddress.where(user_id: @user.id, set_as_default: true).first
        userDefaultZipCode = @defaultAddress.present? ? @defaultAddress.postal_code : @user.default_zip_code   # safer
        @shoppingZipCode = ServableZipCode.getShoppingZipCode(userDefaultZipCode)

        if @cart.checked_out
          if params[:get_current_cart_if_checked_out].present? && params[:get_current_cart_if_checked_out] == "yes"
            getUserCart(@user.id, userDefaultZipCode)   # this function is defined in the "CartConcern" module
          else
            @order = Order.select(:id, :secured_id).find(@cart.order_id)
          end
        else
          getCart(@cart, userDefaultZipCode)   # this function is defined in the "CartConcern" module
        end
      else
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the cart.")
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
