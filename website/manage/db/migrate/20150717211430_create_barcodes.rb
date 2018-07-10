class CreateBarcodes < ActiveRecord::Migration
  def change
    create_table :barcodes do |t|
      t.string :code
      t.string :code_type
      t.references :item, index: true

      t.timestamps
    end

    add_index :barcodes, :code
    add_index :barcodes, :code_type
  end
end
