class FeedbacksController < ApplicationController

  def create
    begin
      feedback = Feedback.new
      feedback.user_ip_address = request.remote_ip
      feedback.assign_attributes(feedbackParams)
      if feedback.save
        Thread.new {
          begin
            FeedbackMailer.newFeedback(feedback).deliver!
          rescue => error
            logger.fatal ["Fail to send new feedback email. (", error.message, ")"].join("")
          end
        }
      end
    rescue => error
      renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Fail to save the message. (", error.message, ")"].join(""))
      return
    end
  end


private
  def feedbackParams
    params.require(:feedback).permit(
      :id,
      :user_id,
      :user_ip_address,
      :user_local_time,
      :user_email,
      :user_phone,
      :content_type,
      :content
    )
  end

end
