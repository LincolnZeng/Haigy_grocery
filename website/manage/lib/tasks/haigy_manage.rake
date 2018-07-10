HAIGY_RAKE_TASK_LIB_PATH = "#{Rails.root}/../../lib/ruby/1.0.0/rake_task"
load File.join(HAIGY_RAKE_TASK_LIB_PATH, "haigy_assets.rake")
load File.join(HAIGY_RAKE_TASK_LIB_PATH, "haigy_backbone.rake")


namespace :haigy_manage do
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

    puts "Running \"rake db:migrate\""
    Rake::Task["db:migrate"].reenable
    Rake::Task["db:migrate"].invoke
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

    puts "\"rake haigy_manage:setup\" is Done!"
    puts
  end


end
