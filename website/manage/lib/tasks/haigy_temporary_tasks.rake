namespace :haigy_temporary_tasks do
  desc "TODO"


  task pre_marketing_fruits_veggies_sale: :environment do
    if Rails.env.production?
      raise "Error: cannot run this task in the production environment."
    end

    ActiveRecord::Base.transaction do
      fruitCategoryId = Item.where(name: "Fruits", is_category: true).pluck(:id).first
      if fruitCategoryId.present?
        allFruits = Item.where(is_category: false).where("parent_category_path like ?", "#{fruitCategoryId}%").pluck(:id)
        allFruitStoreInfos = StoreItemInfo.where(item_id: allFruits)

        infoCount = allFruitStoreInfos.size
        allFruitStoreInfos.each_with_index do |info, index|
          price = info.on_sale ? info.sale_price : info.price
          info.price = price
          info.sale_price = price * 0.9
          info.on_sale = true
          info.save
          puts ["Fruit update progress: ", index + 1, "/", infoCount].join("")
        end
        puts
      end

      vegetableCategoryId = Item.where(name: "Vegetables", is_category: true).pluck(:id).first
      if vegetableCategoryId.present?
        allVegetables = Item.where(is_category: false).where("parent_category_path like ?", "#{vegetableCategoryId}%").pluck(:id)
        allVegetableStoreInfos = StoreItemInfo.where(item_id: allVegetables)

        infoCount = allVegetableStoreInfos.size
        allVegetableStoreInfos.each_with_index do |info, index|
          price = info.on_sale ? info.sale_price : info.price
          info.price = price
          info.sale_price = price * 0.9
          info.on_sale = true
          info.save
          puts ["Vegetable update progress: ", index + 1, "/", infoCount].join("")
        end
      end
      puts
    end
  end


end