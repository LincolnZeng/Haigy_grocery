require 'test_helper'

class BriefInfoItemsControllerTest < ActionController::TestCase
  test "should get browse" do
    get :browse
    assert_response :success
  end

  test "should get show" do
    get :show
    assert_response :success
  end

end
