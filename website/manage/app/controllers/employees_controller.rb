class EmployeesController < ApplicationController

  def index
    begin
      @employees = Employee.all.order(:job_position_id, :first_name)
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def show
    begin
      begin
        @employee = Employee.find(params[:id])
      ensure
        if @employee.blank?   # cannot find the employee, but it is not an error
          @employee = Employee.new
          return
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def create
    begin
      password = params[:password]
      if password.present?
        @employee = Employee.new(employeeParams)
        @employee.email = (@employee.email || "").strip.downcase!
        @employee.password = password
      else
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, "Request parameters are not correct.")
        return
      end

      begin
        @employee.save
      rescue => error
        renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create the employee. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def update
    begin
      begin
        @employee = Employee.find(params[:id])
      ensure
        if @employee.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the employee.")
          return
        end
      end

      currentPassword = params[:current_password]

      if currentPassword.present? && @employee.password == currentPassword
        begin
          password = params[:password]
          if password.present?
            @employee.password = password
          end

          inputParams = employeeParams
          if inputParams[:email].present?
            @employee.email = inputParams[:email].strip.downcase
            inputParams.delete(:email)
          end
          @employee.update(inputParams)
        rescue => error
          renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the employee. (", error.message, ")"].join(""))
          return
        end
      else
        renderError(HaigyManageConstant::Error::AUTHENTICATION_FAILED, "Password is not correct.")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def destroy
    begin
      begin
        @employee = Employee.find(params[:id])
      ensure
        if @employee.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the employee.")
          return
        end
      end

      begin
        @employee.destroy
      rescue => error
        renderError(HaigyManageConstant::Error::DESTROY_RECORD_FAILED, ["Cannot destroy the profile. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  def employeeParams
    params.require(:employee).permit(
      :id,
      :first_name,
      :middle_name,
      :last_name,
      :email,
      :password,
      :current_password,
      :job_position_id
    )
  end


end
