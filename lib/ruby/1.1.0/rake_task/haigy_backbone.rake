require "yaml"


namespace :haigy_backbone do
  desc "TODO"


  # auto generate a route navigator from the Backbone based webapp router
  task router_to_navigator: :environment do
    appDirectory = Rails.root.join("app", "assets", "javascripts", "app")
    routerPath = File.join(appDirectory, "router.jsx")
    navigatorPath = File.join(appDirectory, "/auto_navigator.js")

    if File.exists?(routerPath)
      if File.exists?(navigatorPath)
        FileUtils.rm_f(navigatorPath)
      end

      routerFile = File.new(routerPath, "r")

      routePartsArray = []
      inRouterSection = false
      parseError = false
      parseErrorLineIndex = nil
      lineIndex = 1
      while (line = routerFile.gets)
        if inRouterSection
          routes = line.strip

          if routes[0] == "}"
            inRouterSection = false
          elsif !routes.empty?
            routes = routes.gsub(/['",]/, " ")
            routeParts = routes.rpartition(":")
            if routeParts[1] != ":" || routeParts[2].empty? || routeParts[0].strip.match(/\s/) || routeParts[2].strip.match(/\s/)
              parseError = true
              parseErrorLineIndex = lineIndex
              break
            end
            routePartsArray.push([routeParts[0].strip, routeParts[2].strip])
          end
        end

        if line.include?("routes: {")
          inRouterSection = true
        end

        lineIndex += 1
      end

      if inRouterSection || parseError || routePartsArray.empty?
        if inRouterSection
          puts "Error: router file may be incomplete. Cound not find \"}\" for routes section."
        end
        if parseError
          puts ["Error: line ", parseErrorLineIndex.to_s, " may have some problem."].join("")
        end
        if routePartsArray.empty?
          puts "Error: cannot find any routes. Maybe because it cannot detect the keyword \"routes: {\""
        end
        next
      end

      navigatorFile = File.new(navigatorPath, "w")

      navigatorFile.puts '// This is an auto generated file. Please don\'t modify it directly. Run "rake haigy_route:generate_navigator" instead to update it.'
      navigatorFile.puts 'modulejs.define("app/navigator", ["underscore", "backbone"], function(_, Backbone) {'
      navigatorFile.puts '  "use strict";'
      navigatorFile.puts
      navigatorFile.puts
      navigatorFile.puts '  var backboneNavigate = function(urlHash, options) {'
      navigatorFile.puts '    options = _.extend({trigger: true}, options);'
      navigatorFile.puts '    Backbone.history.navigate(urlHash, options);'
      navigatorFile.puts '  };'
      navigatorFile.puts
      navigatorFile.puts
      navigatorFile.puts '  var navigator = {'
      navigatorFile.puts '    current: function() {'
      navigatorFile.puts '      var hashFragment = Backbone.history.getFragment();'
      navigatorFile.puts '      if (hashFragment && hashFragment.length > 0) {'
      navigatorFile.puts '        return ["#", hashFragment].join("");'
      navigatorFile.puts '      } else {'
      navigatorFile.puts '        return "#";'
      navigatorFile.puts '      }'
      navigatorFile.puts '    },'
      navigatorFile.puts
      navigatorFile.puts
      navigatorFile.puts '    tmp: function() {'
      navigatorFile.puts '      this.visit("#tmp", {trigger: false, replace: true});'
      navigatorFile.puts '    },'
      navigatorFile.puts
      navigatorFile.puts
      navigatorFile.puts '    refresh: function() {'
      navigatorFile.puts '      var currentUrlHash = this.current();'
      navigatorFile.puts '      this.tmp();'
      navigatorFile.puts '      this.visit(currentUrlHash, {replace: true});'
      navigatorFile.puts '    },'
      navigatorFile.puts
      navigatorFile.puts
      navigatorFile.puts '    visit: function(urlHash, options) {'
      navigatorFile.puts '      backboneNavigate(urlHash, options);'
      navigatorFile.puts '    },'
      navigatorFile.puts
      navigatorFile.puts
      navigatorFile.puts '    back: function() {'
      navigatorFile.puts '      Backbone.history.history.back();'
      navigatorFile.puts '    },'
      navigatorFile.puts

      routePartsArray.each do |parts|
        navigatorFile.puts

        firstPart = parts[0].split("/")
        secondPart = parts[1]

        parameters = []
        urlHash = "#"
        urlHashWithParams = []
        firstPart.each do |urlHashSegment|
          if urlHashSegment[0] == ":"
            param = urlHashSegment[1..-1]
            parameters.push(param)

            urlHashWithParams.push(['"', urlHash, '/"'].join(''))
            urlHash = ""

            urlHashWithParams.push(['encodeURIComponent(', param, ')'].join(''))
          else
            if urlHash == "#"
              urlHash += urlHashSegment;
            else
              urlHash += ['/', urlHashSegment].join('')
            end
          end
        end

        if parameters.empty?
          navigatorFile.puts ['    ', secondPart, 'Hash: "', urlHash, '",'].join('')
          navigatorFile.puts ['    ', secondPart, ': function(options) {'].join('')
          navigatorFile.puts ['      backboneNavigate(this.', secondPart, 'Hash, options);'].join('')
          navigatorFile.puts '    },'
        else
          if !urlHash.empty?
            urlHashWithParams.push(['"', urlHash, '"'].join(''))
          end

          navigatorFile.puts ['    ', secondPart, 'Hash: function(', parameters.join(', '), ') {'].join('')
          navigatorFile.puts ['      return [', urlHashWithParams.join(', '), '].join("");'].join('')
          navigatorFile.puts '    },'
          navigatorFile.puts ['    ', secondPart, ': function(', parameters.join(', '), ', options) {'].join('')
          navigatorFile.puts ['      backboneNavigate(this.', secondPart, 'Hash(', parameters.join(', '), '), options);'].join('')
          navigatorFile.puts '    },'
        end

        navigatorFile.puts
      end

      navigatorFile.puts '  };'
      navigatorFile.puts
      navigatorFile.puts
      navigatorFile.puts '  return navigator;'
      navigatorFile.puts '});'

      navigatorFile.close

      routerFile.close

      puts "Successfully generated a navigator from the router."
      puts ['The navigator is in the file: "', navigatorPath, '"'].join("")
    else
      puts ["Error: could not find the router file, router.js, in the directory: \"", appDirectory, "\"."].join("")
    end
  end


  task :generate_model, [:modelName] => [:environment] do |task, args|
    puts
    puts "------ generate model start ------"

    modelName = args.modelName
    if modelName.nil?
      puts "Error: need a model name to generate the model."
      puts "Correct Usage: rake haigy_backbone:generate_model[\"model_name\"]"
      puts "Example: rake haigy_backbone:generate_model[item]"
    else
      modelName = modelName.downcase.singularize
      if modelName.match(/^[a-z]{1}[a-z0-9_]*$/)
        modelDirectory = Rails.root.join("app", "assets", "javascripts", "model")
        if !Dir.exist?(modelDirectory)
          FileUtils.mkdir_p(modelDirectory)
          puts ["mkdir: \"", modelDirectory, "\""].join("")
        end

        modelPath = File.join(modelDirectory, [modelName, ".js"].join(""))
        if File.exist?(modelPath)
          puts ["Warning: stop generating model, because the model file, \"", modelPath, "\", already exists."].join("")
        else
          modelNameWithoutUnderscore = modelName.gsub(/[_]/, "")

          modelFile = File.new(modelPath, "w")

          modelFile.puts ['modulejs.define("model/', modelName, '", ['].join("")
          modelFile.puts '  "backbone",'
          modelFile.puts '  "lib/backbone_cache",'
          modelFile.puts '  "app/utility"'
          modelFile.puts '], function(Backbone, backboneCache, utility) {'
          modelFile.puts '  "use strict";'
          modelFile.puts
          modelFile.puts
          modelFile.puts ['  var ', modelNameWithoutUnderscore, 'Model = Backbone.Model.extend({'].join("")
          modelFile.puts ['    urlRoot: utility.pathToUrl("/', modelName.pluralize, '")'].join("")
          modelFile.puts '  }, {'
          modelFile.puts ['    cacher: backboneCache.generateModelCacher("', modelName, '")'].join("")
          modelFile.puts '  });'
          modelFile.puts
          modelFile.puts
          modelFile.puts ['  return ', modelNameWithoutUnderscore, 'Model;'].join("")
          modelFile.puts '});'

          modelFile.close

          puts ["Successfully Generated Model: \"", modelPath, "\""].join("")
        end
      else
        puts "Error: only letters, numbers, and \"_\" are allowed in the model name, and the first character in the name should be a letter."
      end
    end

    puts "------ generate model end ------"
    puts
  end


  task :destroy_model, [:modelName] => [:environment] do |task, args|
    puts
    puts "------ destroy model start ------"

    modelName = args.modelName
    if modelName.nil?
      puts "Error: need a model name to destroy the model."
      puts "Correct Usage: rake haigy_backbone:destroy_model[\"model_name\"]"
      puts "Example: rake haigy_backbone:destroy_model[item]"
    else
      modelName = modelName.downcase.singularize
      if modelName.match(/^[a-z]{1}[a-z0-9_]*$/)
        modelPath = Rails.root.join("app", "assets", "javascripts", "model", [modelName, ".js"].join(""))

        if File.exist?(modelPath)
          FileUtils.rm_f(modelPath)
          puts ["Successfully Destroyed Model: \"", modelPath, "\""].join("")
        else
          puts ["Warning: stop destroying model, because the model file, \"", modelPath, "\", does not exist."].join("")
        end
      else
        puts "Error: only letters, numbers, and \"_\" are allowed in the model name, and the first character in the name should be a letter."
      end
    end

    puts "------ destroy model end ------"
    puts
  end


  task :generate_collection, [:modelName, :collectionActionName] => [:environment] do |task, args|
    puts
    puts "------ generate collection start ------"

    modelName = args.modelName
    collectionActionName = args.collectionActionName

    if modelName.nil? || collectionActionName.nil?
      puts "Error: need a model name and a collection action name to generate the collection."
      puts "Correct Usage: rake haigy_backbone:generate_collection[\"model_name\", \"collection_action_name\"]"
      puts "Example: rake haigy_backbone:generate_collection[item,index]"
    else
      modelName = modelName.downcase.singularize
      collectionActionName.downcase!

      if modelName.match(/^[a-z]{1}[a-z0-9_]*$/) && collectionActionName.match(/^[a-z]{1}[a-z0-9_]*$/)
        collectionDirectory = Rails.root.join("app", "assets", "javascripts", "collection", modelName)
        if !Dir.exist?(collectionDirectory)
          FileUtils.mkdir_p(collectionDirectory)
          puts ["mkdir: \"", collectionDirectory, "\""].join("")
        end

        collectionPath = File.join(collectionDirectory, [collectionActionName, ".js"].join(""))
        if File.exist?(collectionPath)
          puts ["Warning: stop generating collection, because the collection file, \"", collectionPath, "\", already exists."].join("")
        else
          modelNameWithoutUnderscore = modelName.gsub(/[_]/, "")
          capitalizedActionName = collectionActionName.gsub(/[_]/, "").capitalize

          collectionFile = File.new(collectionPath, "w")

          collectionFile.puts ['modulejs.define("collection/', modelName, '/', collectionActionName, '", ['].join("")
          collectionFile.puts '  "backbone",'
          collectionFile.puts '  "lib/backbone_cache",'
          collectionFile.puts '  "app/utility",'
          collectionFile.puts ['  "model/', modelName, '"'].join("")
          collectionFile.puts ['], function(Backbone, backboneCache, utility, ', modelNameWithoutUnderscore, 'Model) {'].join("")
          collectionFile.puts '  "use strict";'
          collectionFile.puts
          collectionFile.puts
          collectionFile.puts ['  var ', modelNameWithoutUnderscore, capitalizedActionName, 'Collection = Backbone.Collection.extend({'].join("")
          collectionFile.puts '    initialize: function(options) {},'
          collectionFile.puts
          collectionFile.puts
          collectionFile.puts ['    model: ', modelNameWithoutUnderscore, 'Model,'].join("")
          collectionFile.puts
          collectionFile.puts
          collectionFile.puts '    url: function() {'
          collectionFile.puts ['      return utility.pathToUrl("/', modelName.pluralize, '/', collectionActionName, '");'].join("")
          collectionFile.puts '    }'
          collectionFile.puts '  }, {'
          collectionFile.puts ['    cacher: backboneCache.generateCollectionCacher(', modelNameWithoutUnderscore, 'Model, "', collectionActionName, '", [], false, "clear", "update", "remove", 360)'].join("")
          collectionFile.puts '  });'
          collectionFile.puts
          collectionFile.puts
          collectionFile.puts ['  return ', modelNameWithoutUnderscore, capitalizedActionName, 'Collection;'].join("")
          collectionFile.puts '});'

          collectionFile.close

          puts ["Successfully Generated Collection: \"", collectionPath, "\""].join("")
        end
      else
        puts "Error: only letters, numbers, and \"_\" are allowed in the model name and the collection action name, and the first character in the name should be a letter."
      end
    end

    puts "------ generate collection end ------"
    puts
  end


  task :destroy_collection, [:modelName, :collectionActionName] => [:environment] do |task, args|
    puts
    puts "------ destroy collection start ------"

    modelName = args.modelName
    collectionActionName = args.collectionActionName

    if modelName.nil? || collectionActionName.nil?
      puts "Error: need a model name and a collection action name to destroy the collection."
      puts "Correct Usage: rake haigy_backbone:destroy_collection[\"model_name\", \"collection_action_name\"]"
      puts "Example: rake haigy_backbone:destroy_collection[item,index]"
    else
      modelName = modelName.downcase.singularize
      collectionActionName.downcase!

      if modelName.match(/^[a-z]{1}[a-z0-9_]*$/) && collectionActionName.match(/^[a-z]{1}[a-z0-9_]*$/)
        collectionDirectory = Rails.root.join("app", "assets", "javascripts", "collection", modelName)
        collectionPath = File.join(collectionDirectory, [collectionActionName, ".js"].join(""))

        if File.exist?(collectionPath)
          FileUtils.rm_f(collectionPath)
          puts ["Successfully Destroyed Collection: \"", collectionPath, "\""].join("")

          begin
            if Dir.entries(collectionDirectory).length <= 2
              FileUtils.rm_rf(collectionDirectory)
              puts ["rm -rf: \"", collectionDirectory, "\""].join("")
            end
          rescue
          end
        else
          puts ["Warning: stop destroying collection, because the collection file, \"", collectionPath, "\", does not exist."].join("")
        end
      else
        puts "Error: only letters, numbers, and \"_\" are allowed in the model name and the collection action name, and the first character in the name should be a letter."
      end
    end

    puts "------ destroy collection end ------"
    puts
  end


  task :generate_view, [:modelName, :restfulActionName] => [:environment] do |task, args|
    puts
    puts "------ generate view start ------"

    modelName = args.modelName
    restfulActionName = args.restfulActionName

    if modelName.nil? || restfulActionName.nil?
      puts "Error: need a model name and a RESTful action name to generate the view."
      puts "Correct Usage: rake haigy_backbone:generate_view[\"model_name\", \"RESTful_action_name\"]"
      puts "Example: rake haigy_backbone:generate_view[item,edit]"
    else
      modelName = modelName.downcase.singularize
      restfulActionName.downcase!

      if modelName.match(/^[a-z]{1}[a-z0-9_]*$/) && restfulActionName.match(/^[a-z]{1}[a-z0-9_]*$/)
        viewDirectory = Rails.root.join("app", "assets", "javascripts", "view", modelName)
        if !Dir.exist?(viewDirectory)
          FileUtils.mkdir_p(viewDirectory)
          puts ["mkdir: \"", viewDirectory, "\""].join("")
        end

        viewPath = File.join(viewDirectory, [restfulActionName, ".js"].join(""))
        if File.exist?(viewPath)
          puts ["Warning: stop generating view, because the view file, \"", viewPath, "\", already exists."].join("")
        else
          modelNameWithoutUnderscore = modelName.gsub(/[_]/, "")
          capitalizedActionName = restfulActionName.gsub(/[_]/, "").capitalize

          viewFile = File.new(viewPath, "w")

          viewFile.puts ['modulejs.define("view/', modelName, '/', restfulActionName, '", ['].join("")
          viewFile.puts '  "logger",'
          viewFile.puts '  "backbone",'
          viewFile.puts '  "jst",'
          viewFile.puts '  "app/navigator",'
          viewFile.puts '  "app/error_handler"'
          viewFile.puts '], function(logger, Backbone, JST, navigator, errorHandler) {'
          viewFile.puts '  "use strict";'
          viewFile.puts
          viewFile.puts
          viewFile.puts ['  var ', modelNameWithoutUnderscore, capitalizedActionName, 'View = Backbone.View.extend({'].join("")
          viewFile.puts '    initialize: function(options) {},'
          viewFile.puts
          viewFile.puts
          viewFile.puts ['    template: JST["template/', modelName, '/', restfulActionName, '"],'].join("")
          viewFile.puts
          viewFile.puts
          viewFile.puts '    render: function() {'
          viewFile.puts '      this.$el.html(this.template());'
          viewFile.puts '      return this;'
          viewFile.puts '    },'
          viewFile.puts
          viewFile.puts
          viewFile.puts '    events: {},'
          viewFile.puts
          viewFile.puts
          viewFile.puts '    remove: function() {'
          viewFile.puts '      Backbone.View.prototype.remove.call(this);'
          viewFile.puts '    }'
          viewFile.puts '  });'
          viewFile.puts
          viewFile.puts
          viewFile.puts ['  return ', modelNameWithoutUnderscore, capitalizedActionName, 'View;'].join("")
          viewFile.puts '});'

          viewFile.close

          puts ["Successfully Generated View: \"", viewPath, "\""].join("")
        end

        templateDirectory = Rails.root.join("app", "assets", "javascripts", "template", modelName)
        if !Dir.exist?(templateDirectory)
          FileUtils.mkdir_p(templateDirectory)
          puts ["mkdir: \"", templateDirectory, "\""].join("")
        end

        templatePath = File.join(templateDirectory, [restfulActionName, ".jst.ejs"].join(""))
        if File.exist?(templatePath)
          puts ["Warning: stop generating template, because the template file, \"", templatePath, "\", already exists."].join("")
        else
          templateFile = File.new(templatePath, "w")
          templateFile.puts ['<div>This is the template file for the view: "view/', modelName, '/', restfulActionName, '".</div>'].join("")
          templateFile.close

          puts ["Successfully Generated Template: \"", templatePath, "\""].join("")
        end
      else
        puts "Error: only letters, numbers, and \"_\" are allowed in the model name and the RESTful action name, and the first character in the name should be a letter."
      end
    end

    puts "------ generate view end ------"
    puts
  end


  task :destroy_view, [:modelName, :restfulActionName] => [:environment] do |task, args|
    puts
    puts "------ destroy view start ------"

    modelName = args.modelName
    restfulActionName = args.restfulActionName

    if modelName.nil? || restfulActionName.nil?
      puts "Error: need a model name and a RESTful action name to destroy the view."
      puts "Correct Usage: rake haigy_backbone:destroy_view[\"model_name\", \"RESTful_action_name\"]"
      puts "Example: rake haigy_backbone:destroy_view[item,edit]"
    else
      modelName = modelName.downcase.singularize
      restfulActionName.downcase!

      if modelName.match(/^[a-z]{1}[a-z0-9_]*$/) && restfulActionName.match(/^[a-z]{1}[a-z0-9_]*$/)
        viewDirectory = Rails.root.join("app", "assets", "javascripts", "view", modelName)
        viewPath = File.join(viewDirectory, [restfulActionName, ".js"].join(""))

        if File.exist?(viewPath)
          FileUtils.rm_f(viewPath)
          puts ["Successfully Destroyed View: \"", viewPath, "\""].join("")

          begin
            if Dir.entries(viewDirectory).length <= 2
              FileUtils.rm_rf(viewDirectory)
              puts ["rm -rf: \"", viewDirectory, "\""].join("")
            end
          rescue
          end
        else
          puts ["Warning: stop destroying view, because the view file, \"", viewPath, "\", does not exist."].join("")
        end

        templateDirectory = Rails.root.join("app", "assets", "javascripts", "template", modelName)
        templatePath = File.join(templateDirectory, [restfulActionName, ".jst.ejs"].join(""))

        if File.exist?(templatePath)
          FileUtils.rm_f(templatePath)
          puts ["Successfully Destroyed Template: \"", templatePath, "\""].join("")

          begin
            if Dir.entries(templateDirectory).length <= 2
              FileUtils.rm_rf(templateDirectory)
              puts ["rm -rf: \"", templateDirectory, "\""].join("")
            end
          rescue
          end
        else
          puts ["Warning: stop destroying template, because the template file, \"", templatePath, "\", does not exist."].join("")
        end
      else
        puts "Error: only letters, numbers, and \"_\" are allowed in the model name and the RESTful action name, and the first character in the name should be a letter."
      end
    end

    puts "------ destroy view end ------"
    puts
  end


  task :generate, [:modelName, :restfulActionName, :isCollectionAction] => [:environment] do |task, args|
    puts
    puts "------ generate start ------"
    puts

    modelName = args.modelName
    restfulActionName = args.restfulActionName
    isCollectionAction = args.isCollectionAction
    if isCollectionAction.present? && (isCollectionAction == "true" || isCollectionAction == true)
      isCollectionAction = true
    else
      isCollectionAction = false
    end

    if modelName.nil? || restfulActionName.nil?
      puts "Error: need a model name and a RESTful action name for this rake task."
      puts "Correct Usage: rake haigy_backbone:generate[\"model_name\", \"RESTful_action_name\"]"
      puts "Example: rake haigy_backbone:generate[item,index,true]"
    else
      modelName = modelName.downcase.singularize
      restfulActionName.downcase!

      if modelName.match(/^[a-z]{1}[a-z0-9_]*$/) && restfulActionName.match(/^[a-z]{1}[a-z0-9_]*$/)
        Rake::Task["haigy_backbone:generate_model"].reenable
        Rake::Task["haigy_backbone:generate_model"].invoke(modelName)

        if isCollectionAction
          Rake::Task["haigy_backbone:generate_collection"].reenable
          Rake::Task["haigy_backbone:generate_collection"].invoke(modelName, restfulActionName)
        end

        Rake::Task["haigy_backbone:generate_view"].reenable
        Rake::Task["haigy_backbone:generate_view"].invoke(modelName, restfulActionName)
      else
        puts "Error: only letters, numbers, and \"_\" are allowed in the model name and the RESTful action name, and the first character in the name should be a letter."
      end
    end

    puts
    puts "------ generate end ------"
    puts
  end


  task :destroy, [:modelName, :restfulActionName, :isCollectionAction] => [:environment] do |task, args|
    puts
    puts "------ destroy start ------"
    puts

    modelName = args.modelName
    restfulActionName = args.restfulActionName
    isCollectionAction = args.isCollectionAction
    if !isCollectionAction.nil? && (isCollectionAction == "true" || isCollectionAction == true)
      isCollectionAction = true
    else
      isCollectionAction = false
    end

    if modelName.nil? || restfulActionName.nil?
      puts "Error: need a model name and a RESTful action name for this rake task."
      puts "Correct Usage: rake haigy_backbone:destroy[\"model_name\", \"RESTful_action_name\"]"
      puts "Example: rake haigy_backbone:destroy[item,index,true]"
    else
      modelName = modelName.downcase.singularize
      restfulActionName.downcase!

      if modelName.match(/^[a-z]{1}[a-z0-9_]*$/) && restfulActionName.match(/^[a-z]{1}[a-z0-9_]*$/)
        if isCollectionAction
          Rake::Task["haigy_backbone:destroy_collection"].reenable
          Rake::Task["haigy_backbone:destroy_collection"].invoke(modelName, restfulActionName)
        end

        Rake::Task["haigy_backbone:destroy_view"].reenable
        Rake::Task["haigy_backbone:destroy_view"].invoke(modelName, restfulActionName)

        modelPath = Rails.root.join("app", "assets", "javascripts", "model", [modelName, ".js"].join(""))
        if File.exist?(modelPath)
          puts
          puts ["Warning: please manually delete the model file: \"", modelPath, "\". It might be used by other views or collectionsKB."].join("")
          puts
        end
      else
        puts "Error: only letters, numbers, and \"_\" are allowed in the model name and the RESTful action name, and the first character in the name should be a letter."
      end
    end

    puts
    puts "------ destroy end ------"
    puts
  end

end
