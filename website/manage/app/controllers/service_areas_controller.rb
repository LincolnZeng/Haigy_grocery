class ServiceAreasController < ApplicationController
  def index
    begin
      @serviceAreas = ServiceArea.all.order(:name)
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end
end
