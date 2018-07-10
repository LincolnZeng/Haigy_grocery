class CreateCompanies < ActiveRecord::Migration
  def up
    create_table :companies do |t|
      t.string :name
      t.attachment :logo

      t.timestamps
    end

    execute "ALTER TABLE companies AUTO_INCREMENT = 10000"
    add_index :companies, :name
  end

  def down
    remove_index :companies, :name
    drop_table :companies
  end
end
