class CreateEmployees < ActiveRecord::Migration
  def change
    create_table :employees do |t|
      t.string :first_name
      t.string :middle_name
      t.string :last_name
      t.string :email
      t.string :password_hash
      t.string :session_id
      t.string :session_secret_hash
      t.timestamp :session_expire_time
      t.integer :job_position_id, default: HaigyManageConstant::Employee::POSITION_ID[:trainee]

      t.timestamps
    end
    add_index :employees, :email, unique: true
    add_index :employees, :session_id
    add_index :employees, :job_position_id
  end
end
