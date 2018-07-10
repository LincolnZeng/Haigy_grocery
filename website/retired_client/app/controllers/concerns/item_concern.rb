module ItemConcern
  extend ActiveSupport::Concern


  def getDetailedCategoryPath(item)
    begin
      if item.parent_category_item_id == HaigyManageConstant::Item::DEFAULT_PARENT_CATEGORY_ITEM_ID
        return []
      else
        allCategories = [{id: HaigyManageConstant::Item::ROOT_PARENT_CATEGORY_ITEM_ID, name: "Home"}]

        allCategoryIds = item.parent_category_path.split("/")
        categoryPathHash = {}

        Item.select(:id, :name).find(allCategoryIds).each do |category|
          categoryPathHash[category.id.to_s] = {id: category.id, name: category.name}
        end

        allCategoryIds.each do |categoryId|
          allCategories.push(categoryPathHash[categoryId])
        end

        return allCategories
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, ["Unable to get detailed category path. (", error.message, ")"].join(""))
      return nil
    end
  end

end