require 'test_helper'

class UserBindedAccountsControllerTest < ActionController::TestCase
  test "should get search" do
    get :search
    assert_response :success
  end

  test "should get create" do
    get :create
    assert_response :success
  end

end
