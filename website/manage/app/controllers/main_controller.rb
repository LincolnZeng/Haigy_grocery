##
# MainController works as a website starter
class MainController < ApplicationController

  before_filter :validateToken, except: [:index]


	##
	# the entry point for Haigy Manage website
  def index
  end

end
