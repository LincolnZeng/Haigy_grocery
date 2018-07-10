namespace :haigy_assets do

  task clobber: :environment do
    puts
    puts "Running \"rake assets:clobber\""
    Rake::Task["assets:clobber"].reenable
    Rake::Task["assets:clobber"].invoke
    puts
    puts "Done!"
    puts
  end


  task precompile: :environment do
    SEMANTIC_FONTS_PATH = "#{Rails.root}/../../vendor/ui/semantic/2.1.4/dist/themes/haigy/assets/fonts"

    puts
    puts "Running \"rake tmp:clear\""
    Rake::Task["tmp:clear"].reenable
    Rake::Task["tmp:clear"].invoke
    puts

    puts "Running \"rake assets:precompile\""
    Rake::Task["assets:precompile"].reenable
    Rake::Task["assets:precompile"].invoke
    puts

    if File.directory?(SEMANTIC_FONTS_PATH)
      puts "Copy semantic fonts ..."
      destDir = Rails.root.join("public", "assets", "fonts")
      if File.directory?(destDir)
        allUpToDate = true
        Dir.foreach(SEMANTIC_FONTS_PATH) do |fontFileName|
          if fontFileName != "." && fontFileName != ".."
            needCopy = true
            srcFile = File.join(SEMANTIC_FONTS_PATH, fontFileName)
            destFile = File.join(destDir, fontFileName)
            if File.file?(destFile)
              if File.mtime(srcFile) < File.mtime(destFile)
                needCopy = false
              end
            end
            if needCopy
              allUpToDate = false
              FileUtils.cp(srcFile, destFile)
              puts ["copied font file: ", fontFileName].join("")
            end
          end
        end
        if allUpToDate
          puts "all font files are up to date. no copy is needed"
        end
      else
        FileUtils.cp_r(SEMANTIC_FONTS_PATH, destDir)
        puts "copied all font files"
      end
      puts
      puts "Done!"
      puts
    else
      puts
      puts ["Error: cannot find semantic fonts folder: ", SEMANTIC_FONTS_PATH].join("")
      puts
    end
  end

end