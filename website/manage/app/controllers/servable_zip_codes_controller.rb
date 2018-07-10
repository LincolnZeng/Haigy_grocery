class ServableZipCodesController < ApplicationController
  def index
    begin
      @servableZipCodes = ServableZipCode.all.order(:zip_code)
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def create
    begin
      @servableZipCode = ServableZipCode.create(servableZipCodeParams)
    rescue => error
      renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create a zip code. (", error.message, ")"].join(""))
      return
    end
  end


  def update
    begin
      @servableZipCode = ServableZipCode.find(params[:id])
    rescue => error
      renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, ["Cannot find the zip code. (", error.message, ")"].join(""))
      return
    end

    begin
      @servableZipCode.update(servableZipCodeParams)
    rescue => error
      renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the feed. (", error.message, ")"].join(""))
      return
    end
  end


  def destroy
    begin
      @servableZipCode = ServableZipCode.find(params[:id])
    rescue => error
      renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, ["Cannot find the zip code. (", error.message, ")"].join(""))
      return
    end

    begin
      if @servableZipCode.carts.length > 0
        renderError(HaigyManageConstant::Error::NOT_ALLOWED, "Cannot remove this zip code. It has been used by customers.")
        return
      else
        @servableZipCode.destroy
      end
    rescue => error
      renderError(HaigyManageConstant::Error::DESTROY_RECORD_FAILED, ["Cannot destroy the zip code. (", error.message, ")"].join(""))
      return
    end
  end


private
  def servableZipCodeParams
    params.require(:servable_zip_code).permit(:id, :zip_code, :city, :state, :service_area_id)
  end


end
