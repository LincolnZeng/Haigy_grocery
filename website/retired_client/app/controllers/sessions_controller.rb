class SessionsController < ApplicationController

  def create
    begin
      inputParams = sessionParams

      @user = User.where(email: (inputParams[:email] || "").strip.downcase).first

      if @user.present?
        if @user.validPassword?(inputParams[:password])
          userSession = UserSession.new(user_id: @user.id)
          token = userSession.generateNewSession
          userSession.save

          setResponseToken(token)
          @defaultAddress = UserAddress.where(user_id: @user.id, set_as_default: true).first
          @service_area_id = ServableZipCode.getZipCodeServiceAreaId(@user.default_zip_code)

          unless getUserCart(@user.id, @user.default_zip_code)   # this function is defined in the "CartConcern" module
            renderError(@errorCode, @errorMessage)
            return
          end

          Thread.new {
            ActiveRecord::Base.connection_pool.with_connection do
              oldSession = getSessionFromRequestToken(true)
              if oldSession.present?
                oldSession.destroy
              end

              UserSession.where("user_id = ? AND expire_time < ?", @user.id, Time.now).destroy_all
            end
          }
        else
          renderError(HaigyManageConstant::Error::AUTHENTICATION_FAILED, "Email or password is not correct.")
          return
        end
      else
        renderError(HaigyManageConstant::Error::AUTHENTICATION_FAILED, "Email or password is not correct.")
        return
      end
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


  def sessionParams
    params.require(:session).permit(:email, :password)
  end

end
