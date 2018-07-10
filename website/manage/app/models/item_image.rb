class ItemImage < ActiveRecord::Base
  belongs_to :item


  has_attached_file :image, :styles => {:medium => "800x800", :thumb => "150x150"},
    :convert_options => {
      :medium => "-strip -interlace Plane -quality 85% -background white -gravity center -extent 800x800",
      :thumb => "-strip -interlace Plane -quality 85% -background white -gravity center -extent 150x150"
    },
    :default_url => "/images/:style/missing.png",
    :path => ":rails_root/public/system/:class/:attachment/:id_partition/:style/image.:extension",
    :url => "/system/:class/:attachment/:id_partition/:style/image.:extension"

  validates_attachment_content_type :image, :content_type => /\Aimage\/.*\Z/
end
