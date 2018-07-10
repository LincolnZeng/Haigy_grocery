class SessionsController < ApplicationController

  def create
    begin
      if params[:user_id].present?
        @user = User.where(id: params[:user_id]).first
        requestedUser = getUserFromRequestToken(true)
        unless @user.present? && requestedUser.present? && @user.id == requestedUser.id
          renderError(HaigyManageConstant::Error::AUTHENTICATION_FAILED, "Email or password is not correct.")
          return
        end
      else
        @user = User.where(email: (params[:email] || "").strip.downcase).first
        unless @user.present? && @user.validPassword?(params[:password])
          renderError(HaigyManageConstant::Error::AUTHENTICATION_FAILED, "Email or password is not correct.")
          return
        end
      end

      @defaultAddress = UserAddress.where(user_id: @user.id, set_as_default: true).first

      userDefaultZipCode = @defaultAddress.present? ? @defaultAddress.postal_code : @user.default_zip_code   # safer
      @shoppingZipCode = ServableZipCode.getShoppingZipCode(userDefaultZipCode)

      unless getUserCart(@user.id, userDefaultZipCode)   # this function is defined in the "CartConcern" module
        renderError(@errorCode, @errorMessage)
        return
      end

      createNewResponseToken(@user)
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def destroy
    begin
      oldSession = getSessionFromRequestToken()
      if oldSession.present?
        oldSession.destroy
      end
      setResponseToken("")
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  include CartConcern

end
