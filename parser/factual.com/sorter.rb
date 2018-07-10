require "json"
require "fileutils"
require "open-uri"
require "set"


PARSED_RESULTS_FILE_PATH = "output_files/parsed_results.txt"
SORTED_RESULTS_DIRECTORY = "sorted_results"
ITEM_DETAILS_FILENAME = "item_details.txt"
SORTER_LOG_FILE_PATH = "sorter_log.txt"
IMAGE_TYPE = ["jpg", "jpeg", "png", "gif"].to_set


sorterLogFile = File.open(SORTER_LOG_FILE_PATH, "w")


begin
  parsedResultsFile = File.open(PARSED_RESULTS_FILE_PATH, "r")
rescue => error
  sorterLogFile.puts error.message
  puts error.message
end

if parsedResultsFile
  parsedResultsFile.each_line do |line|
    unless line.strip.empty?
      parsedData = {}
      begin
        parsedData = JSON.parse(line)
      rescue => error
        sorterLogFile.puts error.message
        puts error.message
      end

      parsedData.each do |key, value|
        if value["status"] == "ok" && value["response"]["included_rows"] > 0
          if value["response"]["included_rows"] > 1
            sorterLogFile.puts
            sorterLogFile.puts "====== Multiple Items Share One Barcode ======"
            sorterLogFile.puts parsedData
            sorterLogFile.puts "====== ====== ======"
            sorterLogFile.puts
            puts
            puts "====== Multiple Items Share One Barcode ======"
            puts parsedData
            puts "====== ====== ======"
            puts
          else
            itemData = value["response"]["data"][0]
            itemName = itemData["product_name"] || ""

            sorterLogFile.puts ["------", itemName, " | ", key, "------"].join(" ")
            puts ["------", itemName, " | ", key, "------"].join(" ")

            itemFolderName = [itemName.gsub(/[^0-9a-z]/i, '_'), "--", key.split("|").join("_")].join("")
            itemCategory = (itemData["category"] || "unknown category").capitalize
            itemBrand = (itemData["brand"] || "unknown brand")
            begin
              itemFolderPath = File.join(SORTED_RESULTS_DIRECTORY, itemCategory, itemBrand, itemFolderName)
              FileUtils.mkdir_p itemFolderPath
            rescue => error
              sorterLogFile.puts error.message
              puts error.message

              itemFolderPath = File.join(SORTED_RESULTS_DIRECTORY, itemCategory.gsub(/[^0-9a-z\-\ \']/i, '_'), itemBrand.gsub(/[^0-9a-z\-\ \']/i, '_'), itemFolderName)
              FileUtils.mkdir_p itemFolderPath
            end

            itemDetailsFile = File.open(File.join(itemFolderPath, ITEM_DETAILS_FILENAME), "w")
            itemDetailsFile.puts ["barcode: ", key].join("")
            itemDetailsFile.puts

            itemDetailsFile.puts ["name: ", (itemData["product_name"] || "")].join("")
            itemData.delete("product_name")
            itemDetailsFile.puts

            itemDetailsFile.puts "purchase unit: each"
            itemDetailsFile.puts

            itemDetailsFile.puts ["item size: ", (itemData["size"] || []).join(", ")].join("")
            itemData.delete("size")
            itemDetailsFile.puts

            itemDetailsFile.puts ["brand: ", (itemData["brand"] || "")].join("")
            itemData.delete("brand")
            itemDetailsFile.puts

            itemDetailsFile.puts ["manufacturer: ", (itemData["manufacturer"] || "")].join("")
            itemData.delete("manufacturer")
            itemDetailsFile.puts

            itemDetailsFile.puts ["details: ", (itemData["details"] || "")].join("")
            itemData.delete("details")
            itemDetailsFile.puts

            itemDetailsFile.puts ["ingredients: ", (itemData["ingredients"] || "")].join("")
            itemData.delete("ingredients")
            itemDetailsFile.puts

            itemDetailsFile.puts ["warnings: ", (itemData["warnings"] || "")].join("")
            itemData.delete("warnings")
            itemDetailsFile.puts

            itemDetailsFile.puts ["directions: ", (itemData["directions"] || "")].join("")
            itemData.delete("directions")
            itemDetailsFile.puts

            itemDetailsFile.puts ["nutrition facts: ", (itemData["nutrition facts"] || "")].join("")
            itemData.delete("nutrition facts")
            itemDetailsFile.puts

            itemImageUrls = itemData["image_urls"]
            itemData.delete("image_urls")

            unless itemData.empty?
              itemDetailsFile.puts ["other info: ", JSON.generate(itemData)].join("")
            end

            itemDetailsFile.close

            if itemImageUrls && !itemImageUrls.empty?
              itemImageUrls.each_with_index do |url, index|
                itemImageName = url[(url.rindex("/") + 1)..-1].gsub(/[^0-9a-z.]/i, '_')
                itemNameParts = itemImageName.split(".")
                if itemNameParts.length > 1 && IMAGE_TYPE.include?(itemNameParts[-1].downcase)
                  itemImageName = [itemNameParts[0..-2].join("_"), itemNameParts[-1].downcase].join(".")
                else
                  itemImageName = ["unknown_name_", index, ".jpg"].join("")
                end

                begin
                  itemImageStream = open(url)
                  IO.copy_stream(itemImageStream, File.join(itemFolderPath, itemImageName))
                rescue => error
                  sorterLogFile.puts ["[", error.message, "]: ", url].join("")
                  puts ["[", error.message, "]: ", url].join("")
                end
              end
            end

            sorterLogFile.puts
            puts
          end
        end
      end
    end
  end
  parsedResultsFile.close
end


sorterLogFile.puts "Finished!"
sorterLogFile.close


puts "Finished!"