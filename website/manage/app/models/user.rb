class User < ActiveRecord::Base
  include BCrypt


  has_many :user_binded_accounts, dependent: :destroy
  has_many :user_addresses, dependent: :destroy
  has_many :user_sessions, dependent: :destroy
  has_many :orders, dependent: :destroy
  has_many :carts   # not dependent on destroy because the data in carts are valuable


  def password=(newPassword)
    @password = Password.create(newPassword)
    self.password_hash = @password
  end


  def temporaryPassword=(newTemporaryPassword)
    @temporaryPassword = Password.create(newTemporaryPassword)
    self.temporary_password_hash = @temporaryPassword
    self.temporary_password_expiry_time = Time.now + HaigyClientConstant::User::TEMPORARY_PASSWORD_LIFETIME_IN_MINUTES * 60
  end


  def expireTemporaryPassword
    self.temporary_password_expiry_time = Time.now
  end


  def validPassword?(password)
    @password ||= Password.new(password_hash)
    if @password == password
      return true
    else
      if self.temporary_password_expiry_time.present? && Time.now < self.temporary_password_expiry_time
        @temporaryPassword ||= Password.new(temporary_password_hash)
        return @temporaryPassword == password
      else
        return false
      end
    end
  end
end
