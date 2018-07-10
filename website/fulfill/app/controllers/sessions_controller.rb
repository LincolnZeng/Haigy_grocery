class SessionsController < ApplicationController

  before_filter :validateToken, except: [:create]


  def create
    begin
      inputParams = sessionParams

      @employee = Employee.where(email: (inputParams[:email] || "").strip.downcase).first

      if @employee.present?
        if @employee.password == inputParams[:password]
          setResponseToken(@employee.createSession)
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
      setResponseToken("")
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  def sessionParams
    params.require(:session).permit(:email, :password)
  end

end
