HAIGY_RAKE_TASK_LIB_PATH = "#{Rails.root}/../../lib/ruby/1.1.0/rake_task"
load File.join(HAIGY_RAKE_TASK_LIB_PATH, "haigy_assets.rake")
load File.join(HAIGY_RAKE_TASK_LIB_PATH, "haigy_backbone.rake")


namespace :haigy_fulfill do
  desc "TODO"


  task :setup, [:clobberAssets] => [:environment] do |task, args|
    clobberAssets = args.clobberAssets
    if clobberAssets.present? && (clobberAssets == "true" || clobberAssets == true)
      clobberAssets = true
    else
      clobberAssets = false
    end

    puts "Running \"rake npm:install\""
    Rake::Task["npm:install"].reenable
    Rake::Task["npm:install"].invoke
    puts

    puts "Running \"rake haigy_fulfill:model:sync\""
    Rake::Task["haigy_fulfill:model:sync"].reenable
    Rake::Task["haigy_fulfill:model:sync"].invoke
    puts

    if clobberAssets
      puts "Running \"rake haigy_assets:clobber\""
      Rake::Task["haigy_assets:clobber"].reenable
      Rake::Task["haigy_assets:clobber"].invoke
      puts
    end

    puts "Running \"rake haigy_assets:precompile\""
    Rake::Task["haigy_assets:precompile"].reenable
    Rake::Task["haigy_assets:precompile"].invoke
    puts

    sh("touch", Rails.root.join("tmp", "restart.txt").to_s)
    puts

    puts "\"rake haigy_fulfill:setup\" is Done!"
    puts
  end


  namespace :model do

    task sync: :environment do
      HAIGY_MANAGE_WEBAPP_PATH = "#{Rails.root}/../manage"

      puts
      puts "Synchronizing model files with \"manage.haigy.com\" ..."
      FileUtils.rm_rf(Rails.root.join("app", "models"))
      FileUtils.cp_r(File.join(HAIGY_MANAGE_WEBAPP_PATH, "app", "models"), Rails.root.join("app"))
      puts
      puts "Running \"rake db:migrate\" to generate the file \"db/schema.rb\" ..."
      Rake::Task["db:migrate"].reenable
      Rake::Task["db:migrate"].invoke
      puts
      puts "All Done!"
      puts
    end

  end

end
