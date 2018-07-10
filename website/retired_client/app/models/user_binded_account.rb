class UserBindedAccount < ActiveRecord::Base
  belongs_to :user
end
