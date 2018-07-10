class Employee < ActiveRecord::Base
  include BCrypt


  def password=(newPassword)
    @password = Password.create(newPassword)
    self.password_hash = @password
  end

  def password
    @password ||= Password.new(password_hash)
  end


  def sessionSecret=(newSessionSecret)
    @sessionSecret = Password.create(newSessionSecret)
    self.session_secret_hash = @sessionSecret
  end

  def sessionSecret
    @sessionSecret ||= Password.new(session_secret_hash)
  end


  def hasPermission(permission)
    employeePermission = HaigyManageConstant::Employee::INFO[self.job_position_id][:permission]
    if employeePermission.is_a?(Array)
      return employeePermission.include?(permission)
    else
      return false
    end
  end


  def createSession
    secret = SecureRandom.uuid

    currentTime = Time.now
    self.session_id = [currentTime.to_i, ":", SecureRandom.uuid].join("")
    self.sessionSecret = secret
    self.session_expire_time = currentTime + HaigyManageConstant::Session::LIFETIME_IN_SECOND

    if self.save
      return Base64.strict_encode64(JSON.generate({session_id: self.session_id, session_secret: secret}))
    else
      return ""
    end
  end


  def destroySession
    self.session_id = ""
    self.session_secret_hash = ""
    self.session_expire_time = Time.now
    self.save
  end
end
