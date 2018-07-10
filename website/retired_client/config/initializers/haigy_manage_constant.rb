require "yaml"


module HaigyManageConstant
  HAIGY_SETTINGS = YAML.load_file(Rails.root.join("..", "manage", "config", "haigy_manage.yml"))


  module Business
    DELIVERY_FEE = HAIGY_SETTINGS["delivery_fee"] || 6.99
    NON_HAIGY_ITEM_HANDLING_FEE_RATIO = HAIGY_SETTINGS["non_haigy_item_handling_fee_ratio"] || 0.1
    TAX_RATIO = HAIGY_SETTINGS["tax_ratio"] || 0.1
  end


  module Error
    UNEXPECTED_ERROR = {code: 0, http_status: :internal_server_error}

    # database record related errors
    RECORD_NOT_FOUND = {code: 10000, http_status: :not_found}
    CREATE_RECORD_FAILED = {code: 10001, http_status: :internal_server_error}
    UPDATE_RECORD_FAILED = {code: 10002, http_status: :internal_server_error}
    DESTROY_RECORD_FAILED = {code: 10003, http_status: :internal_server_error}

    # request related errors
    PARAMETERS_NOT_CORRECT = {code: 20000, http_status: :bad_request}

    # session
    AUTHENTICATION_FAILED = {code: 30000, http_status: :bad_request}
    INVALID_TOKEN = {code: 30001, http_status: :bad_request}

    # user
    INVALID_EMAIL = {code: 40000, http_status: :not_acceptable}
    EMAIL_REGISTERED = {code: 40001, http_status: :not_acceptable}
    INVALID_PASSWORD = {code: 40002, http_status: :not_acceptable}

    # order
    ZIPCODE_NOT_SERVABLE = {code: 50001, http_status: :not_acceptable}
    ITEM_INFO_OUTDATED = {code: 50002, http_status: :not_acceptable}

    #other
    NOT_ALLOWED = {code: 60001, http_status: :not_acceptable}
  end


  module Company
    HAIGY_ID = 1
    WHOLE_FOODS_MARKET_ID = 2
  end


  module Order
    GUEST_ORDER_VIEWABLE_LIFETIME_SINCE_DELIVERED_IN_DAYS = 7

    STATUS = {
      placed: 10000,
      preparing: 20000,
      delivering: 30000,
      delivered: 40000
    }
  end


  module Item
    PURCHASE_UNIT = {
      per_lb: "per lb",
      each: "each"
    }

    DEFAULT_PARENT_CATEGORY_ITEM_ID = 1
    ROOT_PARENT_CATEGORY_ITEM_ID = 2

    PRODUCE_PRICE_MARKUP_RATIO = HAIGY_SETTINGS["produce_price_markup_ratio"] || 0.20
    WYNN_SCENE_ITEM_PRICE_MARKUP_RATIO = HAIGY_SETTINGS["wynn_scene_item_price_markup_ratio"] || 0.15
  end


  module Session
    LIFETIME_IN_SECOND = 16000   # JavaScript code will use 90% of 16000 as session lifetime, which is four hours
    REQUEST_HEADER_TOKEN_ATTRIBUTE = "Haigy-Manage-Token"
    RESPONSE_HEADER_TOKEN_ATTRIBUTE = "Haigy-Manage-Token"
  end


  module Employee
    PERMISSION_ID = {
      manageItem: 10000,
      manageEmployee: 20000
    }

    PERMISSION_DETAIL = {
      PERMISSION_ID[:manageItem] => {name: "Manage Item"},
      PERMISSION_ID[:manageEmployee] => {name: "Manage Employee"}
    }

    POSITION_ID = {
      manager: 10000,
      shopper: 20000,
      driver: 30000,
      trainee: 1000000
    }

    POSITION_DETAIL = {
      POSITION_ID[:manager] => {title: "Manager", permission: [PERMISSION_ID[:manageItem], PERMISSION_ID[:manageEmployee]].to_set},
      POSITION_ID[:shopper] => {title: "Shopper", permission: [PERMISSION_ID[:manageItem]].to_set},
      POSITION_ID[:driver] => {title: "Driver"},
      POSITION_ID[:trainee] => {title: "Trainee"}
    }
  end


  module Feed
    DIFFERENCE_TOLERANCE_RATIO = 0.2
  end
end