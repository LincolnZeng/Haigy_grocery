class StoresController < ApplicationController
  respond_to :json


  def index
    begin
      if params[:company_id].present?
        @stores = Store.includes(:company).where(company_id: params[:company_id])
      else
        @stores = Store.includes(:company).all
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def create
    begin
      begin
        inputParams = storeParams
        @store = Store.new
        @store.service_area_id = inputParams[:service_area_id]
        @store.company_id = inputParams[:company_id]
        @store.store_name = inputParams[:store_name]
        @store.input_address = inputParams[:input_address]
      rescue => error
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, ["Request parameters are not correct. (", error.message, ")"].join(""))
        return
      end

      begin
        @company = Company.find(@store.company_id)

        # check if the store is a haigy base.
        if @company.name == "Haigy"
          @store.is_haigy_base = true
        end

        @store.company_name = @company.name
      ensure
        if @company.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the store's company.")
          return
        end
      end

      begin
        @store.save
      rescue => error
        renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create the store. (", error.message, ")"].join(""))
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
        @store = Store.find(params[:id])
        @company = @store.company
      ensure
        if @store.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the store.")
          return
        end

        if @company.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the store's company.")
          return
        end
      end

      begin
        inputParams = storeParams
        if inputParams[:service_area_id].present?
          @store.service_area_id = inputParams[:service_area_id]
        end
        if inputParams[:store_name].present?
          @store.store_name = inputParams[:store_name]
        end
        if inputParams[:input_address].present?
          @store.input_address = inputParams[:input_address]
        end
      rescue => error
        renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, ["Request parameters are not correct. (", error.message, ")"].join(""))
        return
      end

      begin
        @store.save
      rescue => error
        renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create the store. (", error.message, ")"].join(""))
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
        @store = Store.find(params[:id])
        @company = @store.company
      ensure
        if @store.blank?
          renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the store.")
          return
        end
      end

      begin
        @store.destroy
      rescue => error
        renderError(HaigyManageConstant::Error::DESTROY_RECORD_FAILED, ["Cannot destroy the store. (", error.message, ")"].join(""))
        return
      end

      if @company.blank?
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the store's company.")
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def show
    begin
      begin
        @store = Store.find(params[:id])
        @company = @store.company
      ensure
        if @store.blank?   # cannot find the store, but it is not an error
          @store = Store.new
          @company = Company.new
          return
        else
          if @company.blank?
            renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, "Cannot find the store's company.")
            return
          end
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


private
  def storeParams
    params.require(:store).permit(
      :id,
      :company_id,
      :service_area_id,
      :company_name,
      :company_logo,
      :store_name,
      :input_address
    )
  end


end
