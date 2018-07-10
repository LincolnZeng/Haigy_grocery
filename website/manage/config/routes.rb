Rails.application.routes.draw do

  resources :service_areas, defaults: {format: :json}, only: [:index]


  resources :servable_zip_codes, defaults: {format: :json}, except: [:new, :edit]


  resources :orders, defaults: {format: :json}, except: [:new, :edit, :create]


  resources :sessions, defaults: {format: :json}, only: [:create, :destroy]


  resources :employees, defaults: {format: :json}, except: [:new, :edit]


  resources :companies, defaults: {format: :json}, except: [:new, :edit]


  resources :stores, defaults: {format: :json}, except: [:new, :edit]


  resources :cart_entries, defaults: {format: :json}, only: [:index, :update]


  resources :item_images, defaults: {format: :json}, only: [:update]


  resources :items, defaults: {format: :json}, except: [:new, :edit] do
    collection do
      get :search
      get :manage
      get :fedButStarving
    end
  end


  resources :store_item_infos, defaults: {format: :json}, except: [:index, :new, :edit] do
    collection do
      get :byItem
      get :byStoreAndItem
      post :updateFromHaigyProduceGrab
    end
  end


  resources :feeds, defaults: {format: :json}, only: [:create, :update, :destroy] do
    collection do
      get :instacart
    end
  end


  resources :feed_mappings, defaults: {format: :json}, except: [:new, :edit]


  resources :analytical_entries, defaults: {format: :json}, only: [:index]


  resources :feedbacks, defaults: {format: :json}, only: [:index]


  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  get "main/index"
  root "main#index"

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
