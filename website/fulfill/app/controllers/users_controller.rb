class UsersController < ApplicationController

  def search
    begin
      userIdList = UserBindedAccount.where(account_type: params[:account_type], account: params[:account]).pluck(:user_id)
      if userIdList.present? && userIdList.length > 0
        @users = User.includes(:user_binded_accounts).where(id: userIdList)
        if @users.blank? || @users.length <= 0
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the user.")
          return
        end
      else
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the user.")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def show
    begin
      @user = User.where(id: params[:id]).first
      if @user.present?
        unless getUserCart(@user.id, @user.default_zip_code)   # this function is defined in the "CartConcern" module
          renderError(@errorCode, @errorMessage)
        end
      else
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the user.")
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
