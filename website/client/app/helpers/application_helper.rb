module ApplicationHelper

  def currentDateInPacificTime
    return Time.now.in_time_zone("Pacific Time (US & Canada)").strftime("%m/%d/%Y")
  end

end
