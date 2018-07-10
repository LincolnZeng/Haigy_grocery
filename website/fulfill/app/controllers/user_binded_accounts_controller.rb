class UserBindedAccountsController < ApplicationController

  def search
    begin
      userIdList = UserBindedAccount.where(account_type: params[:account_type], account: params[:account]).pluck(:user_id)
      if userIdList.present? && userIdList.length > 0
        @users = User.includes(:user_bind_accounts).where(id: userIdList)
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


  def create
    begin
      if params[:zip_code].blank?
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Missing parameter: zip_code.")
      end

      @userBindedAccount = UserBindedAccount.new(userBindedAccountParams)
      @user = User.new
      @userBindedAccount.user = @user

      @user.is_temporary = true

      account = @userBindedAccount.account.strip
      @user.default_zip_code = params[:zip_code].to_s.strip

      case @userBindedAccount.account_type
      when HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:email]
        account = account.downcase
        @user.nickname = ["Guest ", account[0, account.index("@")]].join("")
      when HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:phone]
        @user.nickname = ["Guest ", account[-4..-1]].join("")
      else
        @user.nickname = ["Guest ", account[0..4]].join("")
      end

      @userBindedAccount.account = account

      if UserBindedAccount.exists?(account_type: @userBindedAccount.account_type, account: @userBindedAccount.account)
        renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Fail to add this account. (This account already exists.)"].join(""))
        return
      end

      begin
        ActiveRecord::Base.transaction do
          @userBindedAccount.save
          unless getUserCart(@user.id, @user.default_zip_code)   # this function is defined in the "CartConcern" module
            renderError(@errorCode, @errorMessage)
            return
          end
        end
      rescue => error
        renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Fail to add this account. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  include CartConcern


  def userBindedAccountParams
    params.require(:user_binded_account).permit(
      :id,
      :account_type,
      :account
    )
  end

end
