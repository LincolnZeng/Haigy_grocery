require "net/http"
require "json"


INPUT_FILES_DIRECTORY = "input_files"
OAUTH_KEY_FILE_PATH = "OAuth_Key.txt"
FAIL_TO_PARSE_FILE_PATH = "output_files/fail_to_parse.txt"
ALREADY_PARSED_BARCODES_FILE_PATH = "output_files/already_parsed_barcodes.txt"
PARSED_RESULTS_FILE_PATH = "output_files/parsed_results.txt"


allOauthKeys = []

begin
  oauthKeyFile = File.open(OAUTH_KEY_FILE_PATH, "r")
  oauthKeyFile.each_line do |line|
    unless line.strip.empty?
      allOauthKeys.push(line.strip)
    end
  end
rescue => error
  puts error.message
end

if oauthKeyFile.nil? || allOauthKeys.empty?
  puts "Error: No OAuth Key Is Found."
  exit
end


allBarcodes = {}


Dir.foreach(INPUT_FILES_DIRECTORY) do |filename|
  begin
    if (filename != "." && filename != ".." && filename != ".keep")

      File.open([INPUT_FILES_DIRECTORY, "/", filename].join(""), "r") do |file|
        file.each_line do |line|
          unless line.strip.empty?
            codeParts = line.split("|")

            if codeParts.length > 1
              barcodeAndType = [codeParts[0].strip, codeParts[1].strip]
              allBarcodes[barcodeAndType.join("|")] = barcodeAndType
            else
              failToParseFile = File.open(FAIL_TO_PARSE_FILE_PATH, "a")
              failToParseFile.puts line
              failToParseFile.close
            end
          end
        end
      end

    end
  rescue => error
    puts error.message
  end
end


begin
  alreadyParsedBarcodesFile = File.open(ALREADY_PARSED_BARCODES_FILE_PATH, "r")
rescue => error
  puts error.message
end

if alreadyParsedBarcodesFile
  alreadyParsedBarcodesFile.each_line do |line|
    unless line.strip.empty?
      codeParts = line.split("|")

      if codeParts.length == 2
        allBarcodes.delete(line.strip)
      end
    end
  end
  alreadyParsedBarcodesFile.close
end


begin
  failToParseFile = File.open(FAIL_TO_PARSE_FILE_PATH, "r")
rescue => error
  puts error.message
end

if failToParseFile
  failToParseFile.each_line do |line|
    unless line.strip.empty?
      codeParts = line.split("|")

      if codeParts.length == 2
        allBarcodes.delete(line.strip)
      end
    end
  end
  failToParseFile.close
end


oauthKeysCount = allOauthKeys.size
oauthKeyIndex = 0
puts ["OAuth Key: ", allOauthKeys[oauthKeyIndex]].join("")


allBarcodes.each do |key, value|
  barcodeType = value[1]
  parseDone = false

  while !parseDone && oauthKeyIndex < oauthKeysCount
    if barcodeType == "UPC12"
      alreadyParsedBarcodesFile = File.open(ALREADY_PARSED_BARCODES_FILE_PATH, "a")
      parsedResultsFile = File.open(PARSED_RESULTS_FILE_PATH, "a")

      uri = URI(["http://api.v3.factual.com/t/products-cpg?KEY=", allOauthKeys[oauthKeyIndex], "&filters=%7B%22upc%22%3A%22", value[0],"%22%7D"].join(""))
      response = Net::HTTP.get(uri)
      responseHash = JSON.parse(response)

      if responseHash && responseHash["status"] == "ok"

        parsedResultsFile.puts JSON.generate({key => responseHash})
        parsedResultsFile.puts
        alreadyParsedBarcodesFile.puts key

        parsedResultsFile.close
        alreadyParsedBarcodesFile.close

        puts key
        puts response
        puts
        puts "waiting for 2 seconds ..."
        puts

        parseDone = true
        sleep(2)
      else
        if responseHash && responseHash["status"] == "error" && responseHash["error_type"] == "Auth"
          puts "reached Factual.com API limit. need to change OAuth Key ..."
          puts "change OAuth Key and wait for 2 seconds ..."
          oauthKeyIndex += 1
          puts ["OAuth Key: ", allOauthKeys[oauthKeyIndex]].join("")
        else
          puts "unknown error ..."
          puts responseHash
          exit
        end
      end
    else
      failToParseFile = File.open(FAIL_TO_PARSE_FILE_PATH, "a")
      failToParseFile.puts key
      failToParseFile.close
      parseDone = true
    end
  end

  if !parseDone && oauthKeyIndex >= oauthKeysCount
    puts "used all OAuth Keys' limits today, but still haven't finished all parsing."
    puts "please run this program again tomorrow"
    exit
  end
end


puts
puts "All Done!"