class CreateItems < ActiveRecord::Migration
  def up
    create_table :items do |t|
      t.string :name
      t.integer :display_sequence, null: false, default: 0
      t.boolean :is_category, default: false
      t.integer :parent_category_item_id, default: HaigyManageConstant::Item::DEFAULT_PARENT_CATEGORY_ITEM_ID
      t.string :parent_category_path
      t.integer :tier_in_category_path

      t.integer :bought_count, null: false, default: 0

      # if has_fixed_item_size == true, then use item_size defined here
      # otherwise, use estimated_weight_of_each_in_lb information defined in the store_item_infos table
      t.boolean :has_fixed_item_size, null: false, default: true
      t.string :item_size
      t.string :unit

      t.string :item_keywords   # item keywords are only keywords for the item (category) itself
      t.string :search_keywords   # search keywords are keywords combined item keywords and all keywords for the categories of the item

      # this is used for looking up substitutes for the item
      t.text :substitute_lookup

      t.attachment :cover_image
      t.boolean :temporary_cover_image, default: true
      t.string :brand
      t.string :manufacturer
      t.string :details, limit: 2000
      t.string :ingredients, limit: 2000
      t.string :warnings, limit: 2000
      t.string :directions, limit: 2000
      t.string :nutrition_facts, limit: 2000

      t.boolean :is_produce, null: false, default: false
      t.boolean :is_seasonal, null: false, default: false

      t.boolean :is_organic, null: false, default: false
      t.boolean :is_kosher, null: false, default: false
      t.boolean :is_vegan, null: false, default: false
      t.boolean :is_gluten_free, null: false, default: false
      t.boolean :is_dairy_free, null: false, default: false
      t.boolean :is_egg_free, null: false, default: false
      t.boolean :is_lactose_free, null: false, default: false

      t.timestamps
    end

    execute "ALTER TABLE items AUTO_INCREMENT = 10000"
    add_index :items, :name
    add_index :items, :display_sequence
    add_index :items, :is_category
    add_index :items, :parent_category_item_id
    add_index :items, :parent_category_path
    add_index :items, :tier_in_category_path
    add_index :items, :temporary_cover_image
    add_index :items, :bought_count
  end


  def down
    remove_index :items, :name
    remove_index :items, :display_sequence
    remove_index :items, :is_category
    remove_index :items, :parent_category_item_id
    remove_index :items, :parent_category_path
    remove_index :items, :tier_in_category_path
    remove_index :items, :temporary_cover_image
    remove_index :items, :bought_count
    drop_table :items
  end
end
