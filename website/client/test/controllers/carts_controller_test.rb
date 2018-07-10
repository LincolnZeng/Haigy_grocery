require 'test_helper'

class CartsControllerTest < ActionController::TestCase
  test "should get update" do
    get :update
    assert_response :success
  end

end
