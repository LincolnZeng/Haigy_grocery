class AnalyticalEntriesController < ApplicationController
  before_filter :generateResponseToken, except: [:create]


  def create
    begin
      if params[:secret] == HaigyClientConstant::Analytics::SECRET
        analytical_entry = AnalyticalEntry.new
        analytical_entry.user_ip_address = request.remote_ip
        analytical_entry.assign_attributes(analyticalEntryParams)
        analytical_entry.save
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
