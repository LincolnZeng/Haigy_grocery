task :disabled_rake_task do
  raise "This rake task is disabled in the Haigy FulFill."
end


namespace :db do
  task :rollback => :disabled_rake_task
  task :drop => :disabled_rake_task
  task :reset => :disabled_rake_task
end