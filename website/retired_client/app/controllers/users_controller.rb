class UsersController < ApplicationController

  def create
		begin
			email = (params[:email] || "").strip.downcase
			password = params[:password]
			repeatPassword = params[:repeat_password]
			zipCode = params[:zip_code]

			if User.exists?(email: email)
				renderError(HaigyManageConstant::Error::EMAIL_REGISTERED, "The email address has been registered.")
	  		return
			end

			if password.nil? || password != repeatPassword || password.length < HaigyClientConstant::User::PASSWORD_MIN_LENGTH || password.length > HaigyClientConstant::User::PASSWORD_MAX_LENGTH
				renderError(HaigyManageConstant::Error::INVALID_PASSWORD, "The password is invalid.")
				return
			end

			@user = User.new(
	  		email: email,
	  		password: password,
	  		subscribe_news: params[:subscribe_news],
	  		default_zip_code: zipCode   # it is fine that the default zip code is not a servable zip code
			)

      if validEmail?(email)
      	@user.nickname = email[0, email.index("@")]
      else
      	renderError(HaigyManageConstant::Error::INVALID_EMAIL, "Invalid email address.")
      	return
      end

			# user session
			userSession = UserSession.new
			token = userSession.generateNewSession
      @user.user_sessions << userSession

			# user shopping cart
			cartEntryDataArray = params[:cart]
      @service_area_id = ServableZipCode.getZipCodeServiceAreaId(zipCode)
      cart = createCart(cartEntryDataArray, params[:special_requests], ServableZipCode.getZipCodeId(zipCode))   # this function is defined in the "CartConcern" module
      if cart.present?
        @user.carts << cart
      end

			begin
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
      @user = User.find(params[:id])
      if @user.present?
        inputParams = userParams
        if inputParams[:phone]
          inputParams[:phone] = inputParams[:phone].strip
        end
        if inputParams[:nickname]
          inputParams[:nickname] = inputParams[:nickname].strip
        end

        logger.fatal inputParams

        begin
          email = inputParams[:email]
          inputParams.delete(:email)
          oldPassword = params[:password]
          newPassword = params[:new_password]

          if email.present? || newPassword.present?
            if oldPassword.present? && @user.validPassword?(oldPassword)
              if email.present?   # change email
                email = email.strip.downcase
                if validEmail?(email)
                  if @user.email != email && User.exists?(email: email)
                    renderError(HaigyManageConstant::Error::EMAIL_REGISTERED, "The email address has been registered.")
                    return
                  end
                else
                  renderError(HaigyManageConstant::Error::INVALID_EMAIL, "Invalid email address.")
                  return
                end
                @user.email = email
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
            @user.update(inputParams)
          end
        rescue => error
          renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the user. (", error.message, ")"].join(""))
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
