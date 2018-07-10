module HaigyFulfillConstant

  module Session
    LIFETIME_IN_SECOND = 16000   # JavaScript code will use 90% of 16000 as session lifetime, which is four hours
    REQUEST_HEADER_TOKEN_ATTRIBUTE = "Haigy-Fulfill-Token"
    RESPONSE_HEADER_TOKEN_ATTRIBUTE = "Haigy-Fulfill-Token"
  end


  module DefaultZipCode
    ZIP_CODE = "94530"
    SERVABLE_ZIP_CODE_ID = 1
    SERVICE_AREA_ID = 1
  end


  module User
    BINDED_ACCOUNT_TYPE = {
      phone: 10000,
      email: 20000,
      facebook_messager: 30000
    }
  end

end