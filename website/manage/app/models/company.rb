class Company < ActiveRecord::Base
  has_many :stores, dependent: :destroy

  has_attached_file :logo, :styles => {:medium => "450x450", :thumb => "200x200"},
    :convert_options => {
      :medium => "-background white -gravity center -extent 450x450",
      :thumb => "-background white -gravity center -extent 200x200"
    },
    :default_url => "/images/:style/missing.png",
    :path => ":rails_root/public/system/:class/:attachment/:id_partition/:style/logo.:extension",
    :url => "/system/:class/:attachment/:id_partition/:style/logo.:extension"

  validates_attachment_content_type :logo, :content_type => /\Aimage\/.*\Z/

end
