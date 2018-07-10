class AnalyticalEntriesController < ApplicationController
  before_filter :generateResponseToken, except: [:create]


  def create
    begin
      if params[:secret] == HaigyClientConstant::Analytics::SECRET
        analyticalEntry = AnalyticalEntry.new
        analyticalEntry.user_ip_address = request.remote_ip
        analyticalEntry.assign_attributes(analyticalEntryParams)
        analyticalEntry.save
      end
    rescue => error
      renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create an analytical entry. (", error.message, ")"].join(""))
      return
    end
  end


private
  def analyticalEntryParams
    params.require(:analytical_entry).permit(
      :id,
      :source,
      :keyword,
      :user_id,
      :user_local_time,
      :details
    )
  end

end
