class FeedsController < ApplicationController
  def instacart
    begin
      @feeds = Feed.all.order(:name)
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def create
    begin
      @feed = Feed.create(feedParams)
    rescue => error
      renderError(HaigyManageConstant::Error::CREATE_RECORD_FAILED, ["Cannot create a feed. (", error.message, ")"].join(""))
      return
    end
  end


  def update
    begin
      begin
        @feed = Feed.find(params[:id])
      rescue => error
        renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, ["Cannot find the feed. (", error.message, ")"].join(""))
        return
      end

      feedingData = params[:feeding_data]

      if feedingData.present?
        @feed.is_processing = true
        @feed.has_process_error = false
        @feed.process_error_message = ""
        begin
          @feed.save
        rescue => error
          renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the feed. (", error.message, ")"].join(""))
          return
        end
        digestInstacartFeeding(@feed.id, feedingData)
      else
        begin
          @feed.update(feedParams)
        rescue => error
          renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the feed. (", error.message, ")"].join(""))
          return
        end
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end


  def destroy
    begin
      @feed = Feed.find(params[:id])
    rescue => error
      renderError(HaigyManageConstant::Error::RECORD_NOT_FOUND, ["Cannot find the feed. (", error.message, ")"].join(""))
      return
    end

    begin
      unless @feed.is_processing
        @feed.destroy
      end
    rescue => error
      renderError(HaigyManageConstant::Error::DESTROY_RECORD_FAILED, ["Cannot destroy the feed. (", error.message, ")"].join(""))
      return
    end
  end


private
  def feedParams
    params.require(:feed).permit(:id, :name, :source)
  end


  def digestInstacartFeeding(feedId, feedingData)
    begin
      Thread.new {
        ActiveRecord::Base.connection_pool.with_connection do
          feed = Feed.find(feedId)
          feed.is_processing = false
          feed.has_process_error = true
          feed.process_error_message = ""

          begin
            dataSummary = feedingData.keys.to_set

            if feed.data_summary.present?
              lastDataSummary = JSON.parse(feed.data_summary).to_set
              missingParts = lastDataSummary - dataSummary
              if missingParts.size > lastDataSummary.size * HaigyManageConstant::Feed::DIFFERENCE_TOLERANCE_RATIO
                feed.process_error_message = "Feeding data might be incorrect."
                raise "Too few items in this feeding comparing to the last feeding."
              end
            end

            currentTime = Time.now

            feedingData.each do |instacartId, data|
              feed.process_error_message = ["Not fully digested the feeding. Unexpectedly stopped on the item with Instacart ID: ", instacartId].join("")

              price = (data["price"] || 0.0).to_f * (1.0 + HaigyManageConstant::Business::NON_HAIGY_ITEM_HANDLING_FEE_RATIO)
              unless price > 0.0
                raise "Fail to parse the price."
              end

              salePrice = data["sale_price"]
              onSale = false
              if salePrice.present?
                salePrice = salePrice.to_f * (1.0 + HaigyManageConstant::Business::NON_HAIGY_ITEM_HANDLING_FEE_RATIO)
                unless salePrice > 0.0
                  raise "Fail to parse the sale price."
                end

                if salePrice < price
                  onSale = true
                end
              else
                salePrice = price
              end

              allStoreItemInfoId = FeedMapping.where(instacart_id: instacartId).pluck(:store_item_info_id)
              if allStoreItemInfoId.size > 0
                StoreItemInfo.where(id: allStoreItemInfoId).update_all(
                  price: price,
                  sale_price: salePrice,
                  on_sale: onSale,
                  in_stock: true,
                  updated_at: currentTime
                )
              end
            end

            feed.data_summary = dataSummary.to_json
            feed.is_processing = false
            feed.has_process_error = false
            feed.latest_feed_time = currentTime
            feed.process_error_message = ""
            feed.save
          rescue => error
            feed.process_error_message += [" (", error.message, ")"].join("")
            feed.save
          end
        end
      }
    rescue => error
      logger.fatal error.message
    end
  end

end
