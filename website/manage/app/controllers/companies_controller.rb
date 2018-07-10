class CompaniesController < ApplicationController

  def index
    begin
      @companies = Company.all.order(:name)
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def show
    begin
      begin
        @company = Company.find(params[:id])
      ensure
        if @company.blank?   # cannot find the company, but it is not an error
          @compnay = Company.new
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
      begin
        inputParams = companyParams

        @company = Company.new
        @company.name = inputParams[:name]
        @company.logo = inputParams[:logo]
      rescue => error
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, ["Request parameters are not correct. (", error.message, ")"].join(""))
        return
      end

      begin
        @company.save
      rescue => error
        renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create a company. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def update
    begin
      changeCompanyName = false

      begin
        @company = Company.find(params[:id])
      ensure
        if @company.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the company.")
          return
        end
      end

      begin
        inputParams = companyParams

        if inputParams[:name].present? && @company.name != inputParams[:name]
          changeCompanyName = true
          @company.name = inputParams[:name]
        end

        if inputParams[:logo].present?
          @company.logo = inputParams[:logo]
        end
      rescue => error
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, ["Request parameters are not correct. (", error.message, ")"].join(""))
        return
      end

      begin
        @company.save
        if changeCompanyName
          Store.where(company_id: @company.id).update_all(company_name: @company.name)
        end
      rescue => error
        renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the company. (", error.message, ")"].join(""))
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
        @company = Company.find(params[:id])
      ensure
        if @company.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the company.")
          return
        end
      end

      begin
        @company.destroy
      rescue => error
        renderError(HaigyManageConstant::Error::DESTROY_RECORD_FAILED, ["Cannot destroy the company. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  def companyParams
    params.require(:company).permit(:name, :logo)
  end


end
