task :disabled_in_production_environment do
  raise "This rake task is disabled in the production environment." if Rails.env.production?
end


namespace :db do
  task :rollback => :disabled_in_production_environment
  task :drop => :disabled_in_production_environment
  task :reset => :disabled_in_production_environment
end