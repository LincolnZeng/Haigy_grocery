########################################################################
# usage:
# 1. run "rake haigy_data:reset_all" to reset all data. Be careful, it will remove all your current data in the database.
# 2. run "rake haigy_data:populate_items" to import new data. Suggest to run "rake haigy_data:validate_items_data" first. The data structure for this task is defined in "rake haigy_data:extract_items_from_database"
# 3. run "rake haigy_data:randomize_store_item_info" to randomize store item infos. It should be very useful for debuging and feature development.
# 4. run "rake haigy_data:extract_items_from_database" to extract all items data from the database. The result will be saved in the directory "resource/extracted_items".
# 5. the path for the raw data, please see the method "getEnvironmentSpecificDataPath" below
# 6. common used images should put in the directory: Rails.root.join("resource", "image")
# 7. some rules for the raw data structure:
#      - category name is not related to its directory name. it should be defined in the category details file
#      - category directory should have a cover image file "cover_image.jpg" and a category details file "category_details.txt"
#      - item name is not related to its directory name. it should be defined in the item details file
#      - item directory should have a cover image file "cover_image.jpg" and an item details file "item_details.txt"
#      - if an item has more than one image (cover image), then the length of the image filename matters. If the length is larger than "MAX_FILENAME_LENGTH_FOR_CUSTOMER_VIEWABLE_IMAGE", the image will be only internal viewable.
#      - if you want to manually set the display sequence of items/categories, name their directory in this pattern: "nnn___some name" (here "n" is a number). Please see more details in the method "iterateThroughDataDirectory" below.
#      - the data structure in "category_details.txt" and "item_details.txt" is defined in "rake haigy_data:extract_items_from_database"
########################################################################


namespace :haigy_data do
  desc "TODO"


  require "yaml"

  require Rails.root.join("app", "controllers", "concerns", "store_item_info_concern.rb")
  include StoreItemInfoConcern


  DEVELOPMENT_DATA_PATH = Rails.root.join("resource", "development_data")
  TEST_DATA_PATH = Rails.root.join("resource", "test_data")
  PRODUCTION_DATA_PATH = Rails.root.join("resource", "production_data")
  EXTRACTED_ITEMS_PATH = Rails.root.join("resource", "extracted_items")

  DEFAULT_COVER_IMAGE_PATH = Rails.root.join("resource", "image", "unknown.jpg")
  HIDDEN_DATA_DIRECTORY_NAME = "hidden_data"   # any data in a directory with this name won't be used in the population process

  UNKNOWN_CATEGORY = "unknown_category"
  CATEGORY_DETAILS_FILE_NAME = "category_details.txt"
  ITEM_DETAILS_FILE_NAME = "item_details.txt"
  COVER_IMAGE_FILE_NAME = "cover_image.jpg"
  SUPPORTED_IMAGE_FILE_NAME_REGULAR_EXPRESSION = /[^\s]+(\.(?i)(jpg|png|gif))$/
  MAX_FILENAME_LENGTH_FOR_CUSTOMER_VIEWABLE_IMAGE = 6


  def getEnvironmentSpecificDataPath
    if Rails.env.development?
      return DEVELOPMENT_DATA_PATH
    elsif Rails.env.test?
      return TEST_DATA_PATH
    elsif Rails.env.production?
      return PRODUCTION_DATA_PATH
    else
      puts "error: unknown Rails environment!"
      puts
      return nil
    end
  end


  def sanitizedItemName(itemName)
    return itemName.gsub(/[^0-9a-z\.\-\_]/i, '_')
  end


  def iterateThroughDataDirectory(dataDirectoryPath, categoryHandler, itemHandler)
    unless File.directory?(dataDirectoryPath)
      puts ["error: cannot find the item data directory: ", dataDirectoryPath].join("")
      puts
      return false
    end

    directoryPathQueue = Queue.new
    itemQueue = Queue.new
    directoryPathQueue.push(dataDirectoryPath)
    itemQueue.push(Item.new(
      id: HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID,
      name: "Root",
      tier_in_category_path: 0
    ))

    allHandlersWorkWell = true

    while !directoryPathQueue.empty?
      dirPath = directoryPathQueue.pop
      item = itemQueue.pop

      if File.exists?(File.join(dirPath, ITEM_DETAILS_FILE_NAME))   # item
        allHandlersWorkWell &= itemHandler.call(dirPath, item)
      else   # category
        if item.id.nil?
          allHandlersWorkWell &= categoryHandler.call(dirPath, item)
        end

        Dir.foreach(dirPath) do |subDirName|
          if subDirName != "." && subDirName != ".." && subDirName != HIDDEN_DATA_DIRECTORY_NAME && File.directory?(File.join(dirPath, subDirName))
            directoryPathQueue.push(File.join(dirPath, subDirName))

            if item.id == HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID
              parentCategoryPath = ""
            else
              if item.parent_category_path.empty?
                parentCategoryPath = item.id.to_s
              else
                parentCategoryPath = [item.parent_category_path, "/", item.id.to_s].join("")
              end
            end

            displaySequenceDelimiterIndex = subDirName.index("___")
            if displaySequenceDelimiterIndex.nil?
              displaySequence = 100000
              itemName = subDirName
            else
              displaySequence = begin subDirName[0..displaySequenceDelimiterIndex].to_i rescue 0 end
              itemName = subDirName[(displaySequenceDelimiterIndex + 3)..-1]
            end

            itemQueue.push(Item.new(
              name: itemName.titleize,
              display_sequence: displaySequence,
              parent_category_item_id: item.id,
              parent_category_path: parentCategoryPath,
              tier_in_category_path: item.tier_in_category_path + 1
            ))
          end
        end
      end
    end

    return allHandlersWorkWell
  end


  task validate_items_data: :environment do
    if Rails.env.production?
      raise "Error: cannot run this task in the production environment."
    end

    categoryValidator = lambda do |categoryDirPath, category|
      puts ["====== validating the data directory: ", category.name, " ======"].join("")
      puts

      unless File.exists?(File.join(categoryDirPath, CATEGORY_DETAILS_FILE_NAME))
        puts ["error: cannot find the category details file for the category: ", categoryDirPath].join("")
        puts
        return false
      end
      unless File.exists?(File.join(categoryDirPath, COVER_IMAGE_FILE_NAME))
        puts ["error: cannot find the cover image for the category: ", categoryDirPath].join("")
        puts
        return false
      end
      return true
    end

    itemValidator = lambda do |itemDirPath, item|
      puts ["====== validating the data directory: ", item.name, " ======"].join("")
      puts

      unless File.exists?(File.join(itemDirPath, ITEM_DETAILS_FILE_NAME))
        puts ["error: cannot find the item details file for the item: ", itemDirPath].join("")
        puts
        return false
      end
      unless File.exists?(File.join(itemDirPath, COVER_IMAGE_FILE_NAME))
        puts ["error: cannot find the cover image for the item: ", itemDirPath].join("")
        puts
        return false
      end

      # hasMoreImages = false
      # Dir.foreach(itemDirPath) do |name|
      #   if name != COVER_IMAGE_FILE_NAME && name.index(SUPPORTED_IMAGE_FILE_NAME_REGULAR_EXPRESSION).present? && name.length <= MAX_FILENAME_LENGTH_FOR_CUSTOMER_VIEWABLE_IMAGE
      #     hasMoreImages = true
      #   end
      # end
      # unless hasMoreImages
      #   puts ["warning: the item has at most one image: ", itemDirPath].join("")
      #   puts
      # end

      return true
    end

    passValidation = true
    if File.exists?(DEFAULT_COVER_IMAGE_PATH)
      dataPath = getEnvironmentSpecificDataPath
      passValidation &= iterateThroughDataDirectory(dataPath, categoryValidator, itemValidator)
    else
      passValidation = false
      puts ["error: cannot find the default cover image: ", DEFAULT_COVER_IMAGE_PATH].join("")
      puts
    end

    if passValidation
      puts "All Done!"
      puts
    else
      raise "error: items data are not ready yet for the population"
    end
  end


  task populate_items: :environment do
    if Rails.env.production?
      raise "Error: cannot run this task in the production environment."
    end

    allStores = Store.all
    allStoreHash = {}
    allStores.each do |store|
      allStoreHash[store.store_name] = store
    end

    categoryInserter = lambda do |categoryDirPath, category|
      categoryDetails = YAML.load_file(File.join(categoryDirPath, CATEGORY_DETAILS_FILE_NAME))
      category.is_category = true
      category.name = categoryDetails["name"]
      category.display_sequence = categoryDetails["display_sequence"]
      category.item_keywords = categoryDetails["item_keywords"]
      category.search_keywords = categoryDetails["search_keywords"]

      coverImagePath = DEFAULT_COVER_IMAGE_PATH
      category.temporary_cover_image = true

      if File.exists?(File.join(categoryDirPath, COVER_IMAGE_FILE_NAME))
        coverImagePath = File.join(categoryDirPath, COVER_IMAGE_FILE_NAME)
        category.temporary_cover_image = false
      end

      category.cover_image = File.open(coverImagePath)

      allStoreItemInfos = categoryDetails["store_item_infos"]
      allStoreItemInfos.each do |extractedInfo|
        store = allStoreHash[extractedInfo["store_name"]]
        if store.present?
          storeItemInfo = StoreItemInfo.new(
            is_category_item: extractedInfo["is_category_item"],
            estimated_weight_of_each_in_lb: extractedInfo["estimated_weight_of_each_in_lb"],
            price: extractedInfo["price"],
            sale_price: extractedInfo["sale_price"],
            on_sale: extractedInfo["on_sale"],
            in_stock: extractedInfo["in_stock"],
            out_of_stock_since: extractedInfo["out_of_stock_since"],
            quantity: extractedInfo["quantity"],
            note: extractedInfo["note"],
            store_id: store.id
          )
          category.store_item_infos << storeItemInfo
        end
      end

      if category.save
        puts ["------ category: ", category.name, " ------"].join("")
        puts
        return true
      else
        puts ["!!!!!! error: fail to save the category: ", category.name, " !!!!!!"].join("")
        puts
        return false
      end
    end

    itemInserter = lambda do |itemDirPath, item|
      itemDetails = YAML.load_file(File.join(itemDirPath, ITEM_DETAILS_FILE_NAME))
      item.is_category = false

      item.name = itemDetails["name"]
      item.display_sequence = itemDetails["display_sequence"]
      item.has_fixed_item_size = itemDetails["has_fixed_item_size"]
      item.item_size = itemDetails["item_size"]
      item.unit = itemDetails["unit"]
      item.item_keywords = itemDetails["item_keywords"]
      item.search_keywords = itemDetails["search_keywords"]

      item.brand = itemDetails["brand"]
      item.manufacturer = itemDetails["manufacturer"]
      item.details = itemDetails["details"]
      item.ingredients = itemDetails["ingredients"]
      item.warnings = itemDetails["warnings"]
      item.directions = itemDetails["directions"]
      item.nutrition_facts = itemDetails["nutrition_facts"]

      item.is_produce = itemDetails["is_produce"]
      item.is_seasonal = itemDetails["is_seasonal"]
      item.is_organic = itemDetails["is_organic"]
      item.is_kosher = itemDetails["is_kosher"]
      item.is_vegan = itemDetails["is_vegan"]
      item.is_gluten_free = itemDetails["is_gluten_free"]
      item.is_dairy_free = itemDetails["is_dairy_free"]
      item.is_egg_free = itemDetails["is_egg_free"]
      item.is_lactose_free = itemDetails["is_lactose_free"]

      coverImagePath = DEFAULT_COVER_IMAGE_PATH
      item.temporary_cover_image = true

      hasCoverImage = false
      if File.exists?(File.join(itemDirPath, COVER_IMAGE_FILE_NAME))
        hasCoverImage = true
        coverImagePath = File.join(itemDirPath, COVER_IMAGE_FILE_NAME)
        item.temporary_cover_image = false
      end

      allFileNames = Dir.entries(itemDirPath).sort
      allFileNames.each do |name|
        if name != COVER_IMAGE_FILE_NAME && name.index(SUPPORTED_IMAGE_FILE_NAME_REGULAR_EXPRESSION).present?
          # customer viewable images should be named as "nn.jpg" ("n" is a number)
          if name.length > MAX_FILENAME_LENGTH_FOR_CUSTOMER_VIEWABLE_IMAGE
            moreImage = ItemImage.new(image: File.open(File.join(itemDirPath, name)), customer_viewable: false)
            item.item_images << moreImage
          else
            unless hasCoverImage
              hasCoverImage = true
              coverImagePath = File.join(itemDirPath, name)
              item.temporary_cover_image = false
            else
              moreImage = ItemImage.new(image: File.open(File.join(itemDirPath, name)), customer_viewable: true)
              item.item_images << moreImage
            end
          end
        end
      end

      item.cover_image = File.open(coverImagePath)

      allBarcodes = itemDetails["barcodes"]
      allBarcodes.each do |barcode|
        item.barcodes << Barcode.new(code: barcode["code"], code_type: barcode["code_type"])
      end

      allFeedMappings = itemDetails["feed_mappings"]
      allInstacartId = []
      allFeedMappings.each do |mapping|
        allInstacartId << mapping["instacart_id"]
      end
      allInstacartId = allInstacartId.to_set

      allStoreItemInfos = itemDetails["store_item_infos"]
      allStoreItemInfos.each do |extractedInfo|
        store = allStoreHash[extractedInfo["store_name"]]
        if store.present?
          storeItemInfo = StoreItemInfo.new(
            is_category_item: extractedInfo["is_category_item"],
            estimated_weight_of_each_in_lb: extractedInfo["estimated_weight_of_each_in_lb"],
            price: extractedInfo["price"],
            sale_price: extractedInfo["sale_price"],
            on_sale: extractedInfo["on_sale"],
            in_stock: extractedInfo["in_stock"],
            out_of_stock_since: extractedInfo["out_of_stock_since"],
            quantity: extractedInfo["quantity"],
            note: extractedInfo["note"],
            store_id: store.id
          )
          allInstacartId.each do |instacartId|
            storeItemInfo.feed_mappings << FeedMapping.new(instacart_id: instacartId)
          end
          item.store_item_infos << storeItemInfo
        end
      end

      if item.save
        puts ["------ item: ", item.name, " ------"].join("")
        puts
        return true
      else
        puts ["!!!!!! error: fail to save the item: ", item.name, " !!!!!!"].join("")
        puts
        return false
      end
    end

    dataPath = getEnvironmentSpecificDataPath
    iterateThroughDataDirectory(dataPath, categoryInserter, itemInserter)
  end


  task randomize_store_item_info: :environment do
    if Rails.env.production?
      raise "Error: cannot run this task in the production environment."
    end

    onSaleProbability = 0.3
    inStockProbability = 0.7
    allStoreItemInfos = StoreItemInfo.where(is_category_item: false)

    # initialize a random number generator
    randomNumber = Random.new(Random.new_seed)
    totalCount = allStoreItemInfos.length

    allStoreItemInfos.each_with_index do |info, index|
      puts ["------ ", (index.to_f / totalCount * 100.0).round , "% done ------"].join("")
      puts

      info.price = (randomNumber.rand(30.0) * randomNumber.rand).round(2)

      if randomNumber.rand < onSaleProbability
        info.on_sale = true
        info.sale_price = (info.price * randomNumber.rand).round(2)
      else
        info.on_sale = false
        info.sale_price = info.price
      end

      info.quantity = randomNumber.rand(10000.0).round(1)

      if info.estimated_weight_of_each_in_lb.present?
        info.estimated_weight_of_each_in_lb = (randomNumber.rand(20.0) * randomNumber.rand * randomNumber.rand).round(2)
      end

      daysOffset = HaigyClientConstant::Item::NUMBER_OF_DAYS_DISPLAY_OUT_OF_STOCK_ITEM
      info.out_of_stock_since = (Date.today - daysOffset * 3 + randomNumber.rand(daysOffset * 4)).to_time

      info.save

      updateInStockInfoInStore(info.item_id, info.store_id, (randomNumber.rand < inStockProbability), info.out_of_stock_since)
    end

    puts ["------ all done ------"].join("")
  end


  task reset_all: :environment do
    if Rails.env.production?
      raise "Error: cannot run this task in the production environment."
    end

    puts "Running \"rake tmp:clear\""
    Rake::Task["tmp:clear"].reenable
    Rake::Task["tmp:clear"].invoke
    puts

    puts "Running \"rake db:drop\""
    Rake::Task["db:drop"].reenable
    Rake::Task["db:drop"].invoke
    puts

    puts "Removing Paperclip files ..."
    FileUtils.rm_rf(Rails.root.join("public", "system"))
    puts

    puts "Running \"rake db:create\""
    Rake::Task["db:create"].reenable
    Rake::Task["db:create"].invoke
    puts

    puts "Running \"rake db:migrate\""
    Rake::Task["db:migrate"].reenable
    Rake::Task["db:migrate"].invoke
    puts

    puts "Running \"rake db:seed\""
    Rake::Task["db:seed"].reenable
    Rake::Task["db:seed"].invoke
    puts

    puts "Running \"rake haigy_data:validate_items_data\""
    Rake::Task["haigy_data:validate_items_data"].reenable
    Rake::Task["haigy_data:validate_items_data"].invoke(true)
    puts

    puts "Running \"rake haigy_data:populate_items\""
    Rake::Task["haigy_data:populate_items"].reenable
    Rake::Task["haigy_data:populate_items"].invoke(true)
    puts

    puts "Running \"rake haigy_manage:setup\""
    Rake::Task["haigy_manage:setup"].reenable
    Rake::Task["haigy_manage:setup"].invoke(true)
    puts

    puts "Running \"rake sunspot:reindex\""
    Rake::Task["sunspot:reindex"].reenable
    Rake::Task["sunspot:reindex"].invoke
    puts

    puts "\"rake haigy_data::reset_all\" is Done!"
    puts
  end


  task extract_items_from_database: :environment do
    if Rails.env.production?
      raise "Error: cannot run this task in the production environment."
    end

    allItems = Item.all.includes(:barcodes, :item_images, store_item_infos: [:store, :feed_mappings])

    maxTier = 0
    categoryMap = {}
    allItems.each do |item|
      if item.is_category
        categoryMap[item.id] = {path: sanitizedItemName(item.name), tier: item.tier_in_category_path, parentId: item.parent_category_item_id}
        if item.tier_in_category_path > maxTier
          maxTier = item.tier_in_category_path
        end
      end
    end

    (2..maxTier).each do |tier|
      categoryMap.each do |id, info|
        if info[:tier] == tier
          parentCategory = categoryMap[info[:parentId]]
          if parentCategory.present?
            info[:path] = [parentCategory[:path], "/", info[:path]].join("")
          else
            info[:path] = [UNKNOWN_CATEGORY, "/", info[:path]].join("")
          end
        end
      end
    end

    categoryMap.each do |id, info|
      info[:path] = File.join(EXTRACTED_ITEMS_PATH, info[:path])
    end

    unknownCategoryPath = File.join(EXTRACTED_ITEMS_PATH, UNKNOWN_CATEGORY)
    itemCount = allItems.length
    allItems.each_with_index do |item, index|
      if item.is_category
        puts ["---------- [", index + 1, "/", itemCount,"] category: ", item.name, "----------"].join("")
        puts

        categoryPath = begin categoryMap[item.id][:path] rescue unknownCategoryPath end
        unless File.directory?(categoryPath)
          FileUtils.mkdir_p(categoryPath)
        end

        categoryDetails = item.attributes
        allStoreItemInfos = []
        item.store_item_infos.each do |info|
          infoAttributes = info.attributes
          infoAttributes["store_name"] = info.store.store_name
          allStoreItemInfos << infoAttributes
        end
        categoryDetails["store_item_infos"] = allStoreItemInfos

        File.open(File.join(categoryPath, CATEGORY_DETAILS_FILE_NAME), 'w') {|f| f.write categoryDetails.to_yaml}
        FileUtils.cp(item.cover_image.path(:original), File.join(categoryPath, COVER_IMAGE_FILE_NAME))
      else
        puts ["---------- [", index + 1, "/", itemCount,"] item: ", item.name, "----------"].join("")
        puts

        parentCategory = categoryMap[item.parent_category_item_id]
        if parentCategory.present?
          itemPath = File.join(parentCategory[:path], sanitizedItemName(item.name))
        else
          itemPath = File.join(unknownCategoryPath, sanitizedItemName(item.name))
        end
        unless File.directory?(itemPath)
          FileUtils.mkdir_p(itemPath)
        end

        itemDetails = item.attributes

        allBarcodes = []
        item.barcodes.each do |barcode|
          allBarcodes << barcode.attributes
        end
        itemDetails["barcodes"] = allBarcodes

        allStoreItemInfos = []
        allFeedingMappings = []
        item.store_item_infos.each do |info|
          infoAttributes = info.attributes
          infoAttributes["store_name"] = info.store.store_name
          allStoreItemInfos << infoAttributes
          info.feed_mappings.each do |mapping|
            allFeedingMappings << mapping.attributes
          end
        end
        itemDetails["store_item_infos"] = allStoreItemInfos
        itemDetails["feed_mappings"] = allFeedingMappings

        File.open(File.join(itemPath, ITEM_DETAILS_FILE_NAME), 'w') {|f| f.write itemDetails.to_yaml}
        FileUtils.cp(item.cover_image.path(:original), File.join(itemPath, COVER_IMAGE_FILE_NAME))

        item.item_images.each_with_index do |image, imageIndex|
          FileUtils.cp(image.image.path(:original), File.join(itemPath, image.image_file_name))
        end
      end
    end
  end

end
