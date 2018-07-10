class FeedbacksController < ApplicationController
  def index
    from = params[:from]
    to = params[:to]
    from = from.present? ? from.to_i : 0
    to = to.present? ? to.to_i : 3
    endOfToday = Time.now.end_of_day

    from = endOfToday.since(from * 86400)
    to = endOfToday.since(-to * 86400)

    @feedbacks = Feedback.where("created_at < ? AND created_at > ?", from, to).order(created_at: :desc, id: :desc)
  end
end
