class UserSession < ActiveRecord::Base
  include BCrypt


  belongs_to :user


  def secret=(newSecret)
    @secret = Password.create(newSecret)
    self.secret_hash = @secret
  end

  def secret
    @secret ||= Password.new(secret_hash)
  end


  def generateNewSession
    randomSecret = SecureRandom.uuid

    currentTime = Time.now
    self.secured_id = [currentTime.to_i, "-", SecureRandom.uuid].join("")
    self.secret = randomSecret
    self.expire_time = currentTime + HaigyClientConstant::Session::LIFETIME_IN_SECOND

    # return "token"
    return Base64.strict_encode64(JSON.generate({secured_id: self.secured_id, secret: randomSecret}))
  end

end
