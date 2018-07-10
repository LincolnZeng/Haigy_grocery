class Item < ActiveRecord::Base
	has_many :barcodes, dependent: :destroy
  has_many :item_images, dependent: :destroy
  has_many :store_item_infos, dependent: :destroy
  has_many :cart_entries, dependent: :destroy


  searchable do
    integer :id
    text :name
    text :search_keywords
    text :item_size
    boolean :is_category
    string :parent_category_path
    integer :bought_count

    # join
    join(:store_id, target: StoreItemInfo, type: :integer, join: {from: :item_id, to: :id})
    join(:in_stock, target: StoreItemInfo, type: :boolean, join: {from: :item_id, to: :id})
  end


  has_attached_file :cover_image, :styles => {:medium => "800x800", :thumb => "290x290"},
    :convert_options => {
      :medium => "-strip -interlace Plane -quality 85% -background white -gravity center -extent 800x800",
      :thumb => "-strip -interlace Plane -quality 85% -background white -gravity center -extent 290x290"   # semantic-ui card width is 290px
    },
    :default_url => "/images/:style/missing.png",
    :path => ":rails_root/public/system/:class/:attachment/:id_partition/:style/cover_image.:extension",
    :url => "/system/:class/:attachment/:id_partition/:style/cover_image.:extension"

  validates_attachment_content_type :cover_image, :content_type => /\Aimage\/.*\Z/


  def getItemPath
    if self.parent_category_path.empty?
      return self.id.to_s
    else
      return [self.parent_category_path, "/", self.id].join("")
    end
  end


  def getAllCategoryIds
    return self.parent_category_path.split("/")
  end
end
