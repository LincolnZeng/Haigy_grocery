module UserConcern
  extend ActiveSupport::Concern


  def getTemporaryUserByBindedEmail(email)
    if email.present?
      bindedUserIdList = UserBindedAccount.where(
        account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:email],
        account: email
      ).pluck(:user_id)
      return User.where(id: bindedUserIdList, is_temporary: true).first
    else
      return nil
    end
  end


  def hasBindedEmailForUser(email, userId)
    return UserBindedAccount.exists?(
      account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:email],
      account: email,
      user_id: userId
    )
  end


  def addBindedEmailForUser(email, userId)
    unless hasBindedEmailForUser(email, userId)
      UserBindedAccount.create(
        account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:email],
        account: email,
        user_id: userId
      )
    end
  end


  def removeBindedEmailForUser(email, userId)
    UserBindedAccount.where(
      account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:email],
      account: email,
      user_id: userId
    ).destroy_all
  end


  def hasBindedPhoneForUser(phone, userId)
    return UserBindedAccount.exists?(
      account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:phone],
      account: phone,
      user_id: userId
    )
  end


  def addBindedPhoneForUser(phone, userId)
    unless hasBindedPhoneForUser(phone, userId)
      UserBindedAccount.create(
        account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:phone],
        account: phone,
        user_id: userId
      )
    end
  end


  def removeBindedPhoneForUser(phone, userId)
    UserBindedAccount.where(
      account_type: HaigyFulfillConstant::User::BINDED_ACCOUNT_TYPE[:phone],
      account: phone,
      user_id: userId
    ).destroy_all
  end


end