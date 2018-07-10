require "yaml"


namespace :haigy_cordova do
  desc "TODO"


  task deploy: :environment do
    setting = YAML.load_file(Rails.root.join("config", "haigy_manage.yml"))
    cordovaAppPath = setting["cordova_app_path"] || ""

    if File.directory?(cordovaAppPath)
      cordovaAppPath = File.join(cordovaAppPath, "www")

      FileUtils.mkdir_p(cordovaAppPath)
      FileUtils.rm_rf(Dir.glob(File.join(cordovaAppPath, "*")))
      puts "Cleared the directory: " + cordovaAppPath
      puts

      cordovaAppAssetsPath = File.join(cordovaAppPath, "assets")
      FileUtils.mkdir_p(cordovaAppAssetsPath)
      puts "Created the directory: " + cordovaAppAssetsPath
      puts

      puts "Running \"rake haigy_manage:assets:clobber\""
      Rake::Task["haigy_manage:assets:clobber"].reenable
      Rake::Task["haigy_manage:assets:clobber"].invoke
      puts

      puts "Running \"rake haigy_manage:assets:precompile\""
      Rake::Task["haigy_manage:assets:precompile"].reenable
      Rake::Task["haigy_manage:assets:precompile"].invoke
      puts

      cordovaAppHtmlFile = File.new(File.join(cordovaAppPath, "index.html"), "w")
      cordovaAppHtmlFile.puts "<!DOCTYPE html>"
      cordovaAppHtmlFile.puts "<html lang='en'>"
      cordovaAppHtmlFile.puts "<head>"

      cordovaAppHtmlFile.puts '<meta charset="utf-8">'
      cordovaAppHtmlFile.puts '<meta name="format-detection" content="telephone=no">'
      cordovaAppHtmlFile.puts '<meta name="msapplication-tap-highlight" content="no">'
      cordovaAppHtmlFile.puts '<meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi">'
      cordovaAppHtmlFile.puts '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' \'unsafe-eval\' http://manage.haigy.com/; style-src \'self\' \'unsafe-inline\'; media-src *">'

      cordovaAppHtmlFile.puts "<title>" + (setting["cordova_app_title"] || "") + "</title>"
      cordovaAppHtmlFile.puts "<script type='text/javascript' src='cordova.js'></script>"

      precompiledAssetsPath = Rails.root.join("public", "assets")
      allPrecompiledAssetFileNames = Dir.entries(precompiledAssetsPath)
      allPrecompiledAssetFileNames.each do |assetFileName|
        if assetFileName != "." && assetFileName != ".."
          fileExtension = File.extname(assetFileName)
          if fileExtension != ".gz"
            FileUtils.cp_r(File.join(precompiledAssetsPath, assetFileName), cordovaAppAssetsPath)

            if fileExtension == ".css"
              cordovaAppHtmlFile.puts  "<link href='assets/" + assetFileName + "' media='all' rel='stylesheet' />"
              cordovaCssFilePath = File.join(cordovaAppAssetsPath, assetFileName)
              content = File.read(cordovaCssFilePath)
              new_content = content.gsub("/assets/fonts/semantic_icons", "fonts/semantic_icons")
              File.open(cordovaCssFilePath, "w") {|file| file.puts new_content}
            end

            if fileExtension == ".js"
              cordovaAppHtmlFile.puts "<script type='text/javascript' src='assets/" + assetFileName + "'></script>"
            end
          end
        end
      end

      puts "Copied all precompiled assets to the directory: " + cordovaAppAssetsPath
      puts

      cordovaAppHtmlFile.puts "</head>"
      cordovaAppHtmlFile.puts "<body></body>"
      cordovaAppHtmlFile.puts "</html>"
      cordovaAppHtmlFile.close()

      puts "Finished the Cordova app deployment!"
      puts
    else
      puts "Error: Cannot locate cordova app for this project. Please set a correct cordova path in the file \"config/haigy_manage.yml\" as: cordova_app_path: \"/Example/Cordova/App/Path\""
    end
  end

end
