class MainController < ApplicationController

  before_filter :validateToken, except: [:index]


  ##
  # the entry point for Haigy FulFill website
  def index
  end

end
