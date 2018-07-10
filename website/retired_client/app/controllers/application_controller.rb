class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  # protect_from_forgery with: :exception

  include ERB::Util


  before_filter :generateResponseToken


  def generateResponseToken
    setResponseToken(request.headers[HaigyClientConstant::Session::REQUEST_HEADER_TOKEN_ATTRIBUTE] || "")
  end


  def setResponseToken(token)
    response.headers["Cache-Control"] = "no-cache"
    response.headers[HaigyClientConstant::Session::RESPONSE_HEADER_TOKEN_ATTRIBUTE] = token
  end


  def getSessionFromRequestToken(silenceForError=false)
    begin
      requestToken = request.headers[HaigyClientConstant::Session::REQUEST_HEADER_TOKEN_ATTRIBUTE] || ""
      parsedToken = JSON.parse(Base64.decode64(requestToken))
      session = UserSession.where(secured_id: parsedToken["secured_id"]).first
      if session && session.secret == parsedToken["secret"] && Time.now < session.expire_time
        return session
      end
    rescue => error
      unless silenceForError
        logger.debug error.message
      end
      return nil
    end
  end


  def getUserFromRequestToken(silenceForError=false)
    session = getSessionFromRequestToken(silenceForError)

    if session.present?
      return User.find(session.user_id)
    else
      unless silenceForError
        renderError(HaigyManageConstant::Error::INVALID_TOKEN, "Token is invalid.")
      end
      return nil
    end
  end


  ####################################################
  # below are some very often used tools
  # should move to a "concern" file in the future
  ####################################################

  def getDeliverableStores(deliveryZipCode)
    begin
      serviceAreaId = ServableZipCode.getZipCodeServiceAreaId(deliveryZipCode)
      allDeliverableStores = Store.where(service_area_id: serviceAreaId)
      storeHash = {}
      allDeliverableStores.each do |store|
        storeHash[store.id] = store
      end
      return storeHash
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, ["Unable to get deliverable stores. (", error.message, ")"].join(""))
      return nil
    end
  end

  
  # convert ActiveRecord to a hash with the id as the key
  def convertCollectionToHash(collection)
    hash = {}
    collection.each do |model|
      hash[model.id] = model
    end
    return hash
  end


private
  def renderError(predefinedError, errorMessage)
    logger.info(errorMessage)
    render json: {
      error_code: predefinedError[:code],
      error_message: html_escape(errorMessage)
    }, status: predefinedError[:http_status]
  end

end
