# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)


########## Employee ##########

emailOfEmployeeDingyuZhou = "dingyu.zhou@colorado.edu".downcase
employeeDingyuZhou = Employee.where(email: emailOfEmployeeDingyuZhou).first
if employeeDingyuZhou.present?
  puts "====== Already Existed Employee Record ======"
  puts [employeeDingyuZhou.first_name, employeeDingyuZhou.last_name].join(" ")
  puts
else
  employeeDingyuZhou = Employee.create({
    first_name: "Dingyu",
    last_name: "Zhou",
    email: emailOfEmployeeDingyuZhou,
    password: "asdf1234",
    job_position_id: HaigyManageConstant::Employee::POSITION_ID[:manager]
  })
  puts "====== New Created Employee Record ======"
  puts [employeeDingyuZhou.first_name, employeeDingyuZhou.last_name].join(" ")
  puts
end


emailOfEmployeeTingtingMa = "tingtingma0225@gmail.com".downcase
employeeTingtingMa = Employee.where(email: emailOfEmployeeTingtingMa).first
if employeeTingtingMa.present?
  puts "====== Already Existed Employee Record ======"
  puts [employeeTingtingMa.first_name, employeeTingtingMa.last_name].join(" ")
  puts
else
  employeeTingtingMa = Employee.create({
    first_name: "Tingting",
    last_name: "Ma",
    email: emailOfEmployeeTingtingMa,
    password: "asdf1234",
    job_position_id: HaigyManageConstant::Employee::POSITION_ID[:manager]
  })
  puts "====== New Created Employee Record ======"
  puts [employeeTingtingMa.first_name, employeeTingtingMa.last_name].join(" ")
  puts
end



########## Service Area ##########

defaultServiceAreaName = "el cerrito, ca 94530"
defaultServiceArea = ServiceArea.where(name: defaultServiceAreaName).first
if defaultServiceArea.present?
  puts "====== Already Existed Service Area Record ======"
  puts defaultServiceAreaName
  puts
else
  defaultServiceArea = ServiceArea.create({
    id: HaigyFulfillConstant::DefaultZipCode::SERVICE_AREA_ID,
    name: defaultServiceAreaName,
    office_address: "6922 Gladys Ave, El Cerrito CA 94705",
    description: "Serve Berkeley and Surrounding Area"
  })
  puts "====== New Created Service Area Record ======"
  puts defaultServiceAreaName
  puts
end



########## Company ##########

haigy = "Haigy"
companyHaigy = Company.where(id: HaigyManageConstant::Company::HAIGY_ID).first
if companyHaigy.present?
  puts "====== Already Existed Company Record ======"
  puts haigy
  puts
else
  companyHaigy = Company.create({
    id: HaigyManageConstant::Company::HAIGY_ID,
    name: haigy,
    logo: File.open(Rails.root.join("..", "..", "resource", "picture", "haigy_logo.jpg"))
  })
  puts "====== New Created Company Record ======"
  puts haigy
  puts
end

wholeFoodsMarket = "Whole Foods Market"
companyWholeFoodsMarket = Company.where(id: HaigyManageConstant::Company::WHOLE_FOODS_MARKET_ID).first
if companyWholeFoodsMarket.present?
  puts "====== Already Existed Company Record ======"
  puts wholeFoodsMarket
  puts
else
  companyWholeFoodsMarket = Company.create({
    id: HaigyManageConstant::Company::WHOLE_FOODS_MARKET_ID,
    name: wholeFoodsMarket,
    logo: File.open(Rails.root.join("..", "..", "resource", "picture", "whole_foods_market_logo.jpg"))
  })
  puts "====== New Created Company Record ======"
  puts wholeFoodsMarket
  puts
end



########## Store ##########

haigy94530 = "haigy - el cerrito, ca 94530"
storeHaigy94530 = Store.where(store_name: haigy94530).first
if storeHaigy94530.present?
  puts "====== Already Existed Store Record ======"
  puts haigy94530
  puts storeHaigy94530.formatted_address
  puts
else
  storeHaigy94530 = Store.create({
    company_name: companyHaigy.name,
    store_name: haigy94530,
    is_haigy_base: true,
    company_id: companyHaigy.id,
    service_area_id: defaultServiceArea.id,
    input_address: "6922 Gladys Ave, El Cerrito, CA 94618"
  })
  puts "====== New Created Store Record ======"
  puts haigy94530
  puts storeHaigy94530.formatted_address
  puts
end

wholeFoodsMarket94705 = "whole foods market - berkeley, ca 94705"
storeWholeFoodsMarket94705 = Store.where(store_name: wholeFoodsMarket94705).first
if storeWholeFoodsMarket94705.present?
  puts "====== Already Existed Store Record ======"
  puts wholeFoodsMarket94705
  puts storeWholeFoodsMarket94705.formatted_address
  puts
else
  storeWholeFoodsMarket94705 = Store.create({
    company_name: companyWholeFoodsMarket.name,
    store_name: wholeFoodsMarket94705,
    is_haigy_base: false,
    company_id: companyWholeFoodsMarket.id,
    service_area_id: defaultServiceArea.id,
    input_address: "3000 Telegraph Ave, Berkeley, CA 94705"
  })
  puts "====== New Created Store Record ======"
  puts wholeFoodsMarket94705
  puts storeWholeFoodsMarket94705.formatted_address
  puts
end



########## Servable Zip Code ##########

defaultZipCode = HaigyFulfillConstant::DefaultZipCode::ZIP_CODE
defaultServableZipCode = ServableZipCode.where(zip_code: defaultZipCode).first
if defaultServableZipCode.present?
  puts "====== Already Existed Servable Zip Code Record ======"
  puts defaultZipCode
  puts
else
  defaultServableZipCode = ServableZipCode.create({
    id: HaigyFulfillConstant::DefaultZipCode::SERVABLE_ZIP_CODE_ID,
    zip_code: defaultZipCode,
    city: "El Cerrito",
    state: "CA",
    service_area_id: defaultServiceArea.id
  })
  puts "====== New Created Servable Zip Code Record ======"
  puts defaultZipCode
  puts
end
