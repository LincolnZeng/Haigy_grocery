require 'test_helper'

class ItemsControllerTest < ActionController::TestCase
  test "should get scan" do
    get :scan
    assert_response :success
  end

end
