class UsersController < ApplicationController

  def create
		begin
      userId = (params[:user_id] || "").to_s
			email = (params[:email] || "").to_s.strip.downcase
      phone = params[:phone]
			password = params[:password]
			repeatPassword = params[:repeat_password]
			zipCode = params[:zip_code]
      address = params[:address]

      unless validEmail?(email)
        renderError(HaigyManageConstant::Error::INVALID_EMAIL, "Invalid email address.")
        return
      end

			if password.nil? || password != repeatPassword || password.length < HaigyClientConstant::User::PASSWORD_MIN_LENGTH || password.length > HaigyClientConstant::User::PASSWORD_MAX_LENGTH
				renderError(HaigyManageConstant::Error::INVALID_PASSWORD, "The password is invalid.")
				return
			end

      @user = User.where(email: email).first
      if @user.present?
        if @user.id.to_s != userId
          renderError(HaigyManageConstant::Error::EMAIL_REGISTERED, "The email address has been registered.")
          return
        end
      else
        if userId.present?
          @user = User.find(userId)
        else
          @user = User.new

          # user shopping cart
          cartEntryDataArray = params[:cart]
          cart = createCart(cartEntryDataArray)   # this function is defined in the "CartConcern" module
          if cart.present?
            @user.carts << cart
          end
        end
      end

      @user.email = email
      unless hasBindedEmailForUser(email, @user.id)
        @user.user_binded_accounts << UserBindedAccount.new(account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:email], account: email)
      end
      if phone.present?
        @user.phone = phone
        unless hasBindedPhoneForUser(phone, @user.id)
          @user.user_binded_accounts << UserBindedAccount.new(account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:phone], account: phone)
        end
      end

      @user.is_temporary = false
      @user.password = password
      @user.default_zip_code = zipCode
    	@user.nickname = email[0, email.index("@")]

			# user session
			userSession = UserSession.new
			token = userSession.generateNewSession
      @user.user_sessions << userSession

      if address.present?
        userAddress = UserAddress.new(
          is_business_address: address["is_business_address"],
          business_name: address["business_name"],
          input_address: address["input_address"],
          note: address["note"]
        )
        userAddress.geocode
        if userAddress.postal_code == @user.default_zip_code
          userAddress.set_as_default = true
          @defaultAddress = userAddress
        end
        @user.user_addresses << userAddress
      end

      @shoppingZipCode = ServableZipCode.getShoppingZipCode(@user.default_zip_code)

			begin
        ActiveRecord::Base.transaction do
          if @user.save
            Thread.new {
              begin
                UserMailer.welcome(@user).deliver!
              rescue => error
                logger.fatal ["Fail to send user welcome email. (", error.message, ")"].join("")
              end
            }
          	setResponseToken(token)
            unless getUserCart(@user.id, zipCode)   # this function is defined in the "CartConcern" module
              renderError(@errorCode, @errorMessage)
              return
            end
          else
            renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, "Sign up failed.")
            return
          end
        end
			rescue => error
				renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Sign up failed. (", error.message, ")"].join(""))
				return
			end
		rescue => error
		  renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
		  return
		end
  end


  def update
    begin
      ActiveRecord::Base.transaction do
        @user = User.find(params[:id])
        if @user.present?
          inputParams = userParams
          if inputParams[:phone].present?
            oldPhone = @user.phone
            newPhone = inputParams[:phone].strip
            inputParams[:phone] = newPhone

            removeBindedPhoneForUser(oldPhone, @user.id)   # this function is defined in the "UserConcern" module
            addBindedPhoneForUser(newPhone, @user.id)   # this function is defined in the "UserConcern" module
          end
          if inputParams[:nickname].present?
            inputParams[:nickname] = inputParams[:nickname].strip
          end

          begin
            newEmail = inputParams[:email]
            inputParams.delete(:email)
            oldPassword = params[:password]
            newPassword = params[:new_password]

            if newEmail.present? || newPassword.present?
              if oldPassword.present? && @user.validPassword?(oldPassword)
                if newEmail.present?   # change email
                  oldEmail = @user.email
                  newEmail = newEmail.strip.downcase
                  if validEmail?(newEmail)
                    if oldEmail != newEmail && User.exists?(email: newEmail)
                      renderError(HaigyManageConstant::Error::EMAIL_REGISTERED, "The email address has been registered.")
                      return
                    end
                  else
                    renderError(HaigyManageConstant::Error::INVALID_EMAIL, "Invalid email address.")
                    return
                  end
                  @user.email = newEmail

                  removeBindedEmailForUser(oldEmail, @user.id)   # this function is defined in the "UserConcern" module
                  addBindedEmailForUser(newEmail, @user.id)   # this function is defined in the "UserConcern" module
                elsif newPassword.present?   # change password
                  @user.password = newPassword
                  @user.expireTemporaryPassword
                end
                @user.save
              else
                renderError(HaigyManageConstant::Error::AUTHENTICATION_FAILED, "Password is not correct.")
                return
              end
            else
              @user.assign_attributes(inputParams)
              @user.save
            end
          rescue => error
            renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the user. (", error.message, ")"].join(""))
            return
          end
        else
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the user.")
          return
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def show
		begin
		  @user = User.find(params[:id])
		  if @user.blank?
		    renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the user.")
		    return
		  end
		rescue => error
		  renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
		  return
		end
  end


  def destroy
    begin
      @user = User.find(params[:id])
      if @user.present?
      	ActiveRecord::Base.transaction do
        	Cart.where(user_id: @user.id, checked_out: false).destroy_all
        	@user.destroy
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


  def recoverPassword
    begin
      user = User.where(email: params[:email].strip.downcase).first
      if user.present?
        temporaryPassword = SecureRandom.urlsafe_base64(9)
        user.temporaryPassword = temporaryPassword
        if user.save
          @temporaryPasswordLifetimeInMinutes = HaigyClientConstant::User::TEMPORARY_PASSWORD_LIFETIME_IN_MINUTES
          Thread.new {
            begin
              UserMailer.recoverPassword(user, temporaryPassword, @temporaryPasswordLifetimeInMinutes).deliver!
            rescue => error
              logger.fatal ["Fail to send user password recovery email. (", error.message, ")"].join("")
            end
          }
        else
          renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Set the temporary password failed. (", error.message, ")"].join(""))
          return
        end
      else
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Sorry, this email is not registered with Haigy.")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  include CartConcern
  include UserConcern


  def userParams
    params.require(:user).permit(
      :id,
      :nickname,
      :email,
      :phone
    )
  end


  def validEmail?(email)   # TODO: make this validator better
    atSymbolPostion = email.index("@")
    if atSymbolPostion
      return true
    else
      return false
    end
  end


end
