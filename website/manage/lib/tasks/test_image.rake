# these tasks are changed from some old ones.
# they haven't been well tested and might need some work.
namespace :test_image do
  desc "TODO"


  task clear_all: :environment do
    if Rails.env.production?
      raise "Error: cannot run this task in the production environment."
    end

    testImageCategory = Item.where(name: "Test Image", is_category: true).first
    if testImageCategory.present?
      Item.where(parent_category_item_id: testImageCategory.id).destroy_all
      testImageCategory.destroy
    end
    puts "Done!"
  end


  task populate: :environment do
    if Rails.env.production?
      raise "Error: cannot run this task in the production environment."
    end

    TEST_IMAGE_PATH = Rails.root.join("resource", "test_image")

    unless File.directory?(TEST_IMAGE_PATH)
      puts
      puts ["error: cannot find the test image directory: ", TEST_IMAGE_PATH].join("")
      puts
      exit
    end

    store = Store.first

    if store.present?
      puts "---------- Test Image Category ----------"
      puts

      testImageCategoryName = "Test Image"
      testImageCategory = Item.where(name: testImageCategoryName, is_category: true).first
      if testImageCategory.blank?
        testImageCategory = Item.create(
          name: testImageCategoryName,
          is_category: true,
          parent_category_item_id: HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID,
          parent_category_path: "",
          tier_in_category_path: 1,
          cover_image: File.open(Rails.root.join("resource", "image", "unknown.jpeg"))
        )
      end

      unless StoreItemInfo.exists?(is_category_item: true, item_id: testImageCategory.id, store_id: store.id)
        StoreItemInfo.create(is_category_item: true, item_id: testImageCategory.id, store_id: store.id)
      end

      Dir.foreach(TEST_IMAGE_PATH) do |name|
        if name != "." && name != ".."
          puts ["---------- ", name, " ----------"].join("")
          puts

          item = Item.create(
            name: name,
            parent_category_item_id: testImageCategory.id,
            parent_category_path: testImageCategory.id.to_s,
            tier_in_category_path: 2,
            cover_image: File.open(File.join(TEST_IMAGE_PATH, name))
          )

          StoreItemInfo.create(item_id: item.id, store_id: store.id, price: 1.0, sale_price: 1.0)
        end
      end

      puts "Done!"
    else
      puts "Error: Please add a store first."
    end
  end


end