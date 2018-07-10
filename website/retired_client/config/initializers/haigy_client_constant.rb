require "yaml"


module HaigyClientConstant
  HAIGY_SETTINGS = YAML.load_file(Rails.root.join("..", "retired_client", "config", "haigy.yml"))


  module Analytics
    SECRET = HAIGY_SETTINGS["analytics_secret"] || "haigy client analytics secret"
  end


  module Demo
    SERVICE_AREA_ID = 1

    SERVABLE_ZIP_CODE = "00000"
    SERVABLE_ZIP_CODE_ID = 1
  end


  module User
    PASSWORD_MIN_LENGTH = 8
    PASSWORD_MAX_LENGTH = 50
    TEMPORARY_PASSWORD_LIFETIME_IN_MINUTES = 20
  end


  module Session
    LIFETIME_IN_SECOND = 1344000   # JavaScript code will use 90% of 1344000 as session lifetime, which is two weeks
    REQUEST_HEADER_TOKEN_ATTRIBUTE = "Haigy-Client-Token"
    RESPONSE_HEADER_TOKEN_ATTRIBUTE = "Haigy-Client-Token"
  end


  module Item
    NUMBER_OF_DAYS_DISPLAY_OUT_OF_STOCK_ITEM = 7

    MAX_BROWSE_ITEM_COUNT_ON_FIRST_LOAD = 30
    SEARCH_COUNT_PER_PAGE = 30
    OUTDATED_PRICE_TOLERANCE_IN_PERCENTAGE = 0.1   # 10%

    UNIT_PER_LB = "per lb"
    PURCHASE_UNIT = {   # the keys here are also the price unit display.
      "each" => {quantity_per_change: 1, quantity_unit_display: " "},
      "per bunch" => {quantity_per_change: 1, quantity_unit_display: "bunch(s)"}
    }
    PURCHASE_UNIT[UNIT_PER_LB] = {quantity_per_change: 0.25, quantity_unit_display: "lb(s)"}
  end

end
