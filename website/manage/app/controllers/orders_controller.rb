class OrdersController < ApplicationController
  require "stripe"


  def index
    begin
      @orders = Order.includes(:cart).all.order(id: :desc)
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end

  def show
    begin
      securedId = params[:id]   # always use secured_id to do the order fetching
      @order = Order.includes(:cart).where(secured_id: securedId).first
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end

  def update
    begin
      inputParams = orderParams
      @order = Order.includes(:cart).where(secured_id: inputParams[:id]).first
      begin
        if inputParams[:status].present?
          @order.status = inputParams[:status]
          if @order.status == HaigyManageConstant::Order::STATUS[:delivered]
            @order.expire_time = Time.now + HaigyManageConstant::Order::GUEST_ORDER_VIEWABLE_LIFETIME_SINCE_DELIVERED_IN_DAYS * 24 * 60 * 60
          end
        end

        if inputParams[:delivery_fee].present?
          @order.delivery_fee = inputParams[:delivery_fee]
        end

        if inputParams[:total_amount_paid].present?
          @order.total_amount_paid = inputParams[:total_amount_paid]

          if inputParams[:is_stripe_payment] == @order.is_stripe_payment
            if @order.is_stripe_payment
              Stripe.api_key = HaigyManageConstant::Stripe::SECRET_KEY
              stripeTokenId = @order.stripe_token_id

              # Create a charge: this will charge the user's card
              begin
                stripeCharge = Stripe::Charge.create(
                  :amount => (@order.total_amount_paid * 100).to_i, # Amount in cents
                  :currency => "usd",
                  :source => stripeTokenId,
                  :description => "Collect Stripe Payment",
                  :metadata => {"order_id" => @order.id}
                )

                @order.is_paid = true
                @order.stripe_charge_id = stripeCharge.id
              rescue Stripe::CardError => error
                renderError(HaigyManageConstant::Error::STRIPE_PAYMENT_FAILED, ["Stripe payment failed. (", error.message, ")"].join(""))
                return
              rescue => error
                renderError(HaigyManageConstant::Error::STRIPE_PAYMENT_FAILED, ["Stripe payment failed. (", error.message, ")"].join(""))
                return
              end
            else
              @order.is_paid = true
            end
          else
            renderError(HaigyManageConstant::Error::PARAMETERS_NOT_CORRECT, ["Request parameters are not correct. (", error.message, ")"].join(""))
            return
          end
        end

        @order.save
      rescue => error
        renderError(HaigyManageConstant::Error::UPDATE_RECORD_FAILED, ["Cannot update the order. (", error.message, ")"].join(""))
        return
      end
    rescue => error
      renderError(HaigyManageConstant::Error::UNEXPECTED_ERROR, error.message)
      return
    end
  end

private
  def orderParams
    params.require(:order).permit(
      :id,
      :created,
      :secured_id,
      :status,
      :cart_id,
      :delivery_fee,
      :is_paid,
      :total_amount_paid,
      :is_stripe_payment,
      :stripe_token_id
    )
  end

end