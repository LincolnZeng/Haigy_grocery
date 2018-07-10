var haigyBarcodeCollector = {
  // Application Constructor
  initialize: function() {
    _.bindAll(this, "onDeviceReady");
    _.bindAll(this, "startScan");
    _.bindAll(this, "scanSuccessCallback");
    _.bindAll(this, "saveScanResult");

    document.addEventListener('deviceready', this.onDeviceReady, false);

    this.resetBarcodeCollector;
  },


  resetBarcodeCollector: function() {
    this.barcode = null;
    this.barcodeType = null;
    this.needFurtherAttention = false;

    $("body").removeClass("haigy-background-error");
    $("#haigy-barcode-collector-result").hide();
    $("#haigy-barcode-collector-barcode").html("N/A");
    $("#haigy-barcode-collector-barcode-type").html("N/A");

    $("#haigy-barcode-today-data").empty();
    $("#haigy-barcode-show-today-data-link-wrapper").show();
    $("#haigy-barcode-today-data-container").show();
  },


  onDeviceReady: function() {
    var that = this;

    $(function() {
      $("#haigy-barcode-collector-start").on("click", function() {
        that.startScan();
      });

      $("#haigy-barcode-collector-ignore").on("click", function() {
        that.ignoreScanResult();
      });

      $("#haigy-barcode-collector-save-with-attention").on("click", function() {
        that.saveScanResultWithAttention();
      });

      $("#haigy-barcode-collector-save").on("click", function() {
        that.saveScanResult();
      });

      $("#haigy-barcode-show-today-data-link").on("click", function(event) {
        event.preventDefault();
        that.readBarcodeFromTodayFile();
      });
    });
  },


  startScan: function() {
    var that = this;

    that.resetBarcodeCollector();

    cordova.exec(
      that.scanSuccessCallback,
      that.scanErrorCallback,
      "ScanditSDK",
      "scan",
      [
        "V+BVC80ojNDttpE+Z4cfN51N5LCBVoW47EaZIBH4rIo",
        {
          "beep": false,
          "vibrate": true,
          "code128": false,
          "dataMatrix": false,
          "disableStandbyState": true
        }
      ]
    );
  },


  scanSuccessCallback: function(resultArray) {
    var that = this;

    that.barcode = resultArray[0];
    that.barcodeType = resultArray[1] || "UNKNOWN";

    if (that.barcodeType !== "UPC12") {
      $("body").addClass("haigy-background-error");
    }

    $("#haigy-barcode-today-data-container").hide();

    $("#haigy-barcode-collector-barcode").html(that.barcode);
    $("#haigy-barcode-collector-barcode-type").html(that.barcodeType);
    $("#haigy-barcode-collector-result").show({
      complete: function() {
        that.saveScanResult();
      }
    });
  },


  scanErrorCallback: function(error) {
    var errorMessage = ["Scan Failed: ", error].join("");
    console.log(errorMessage);
    alert(errorMessage);
  },


  ignoreScanResult: function() {
    this.startScan();
  },


  saveScanResultWithAttention: function() {
    this.needFurtherAttention = true;
    this.writeBarcodeIntoTodayFile();
  },


  saveScanResult: function() {
    this.needFurtherAttention = false;
    this.writeBarcodeIntoTodayFile();
  },


  writeBarcodeIntoTodayFile: function() {
    var that = this;

    that.operateTodayBarcodeFile(function(file) {
      file.createWriter(
        function(writer) {
          writer.onwriteend = function() {
            that.startScan();
          };

          if (that.barcode && that.barcodeType) {
            var barcodeData = [that.barcode, that.barcodeType];
            if (that.needFurtherAttention) {
              barcodeData.push("!!!");
            }
            writer.seek(writer.length);
            writer.write(barcodeData.join(" | ") + " \r\n");
          } else {
            var errorMessage = "Either barcode or the barcode type is not correct.";
            console.log(errorMessage);
            alert(errorMessage);
            writer.write("");
          }
        },

        function(error) {
          console.log(["error: fail to create the file writer. (", error.code, ")"].join(""));
        }
      );
    });
  },


  readBarcodeFromTodayFile: function() {
    var that = this;

    that.operateTodayBarcodeFile(function(file) {
      file.file(
        function(fileContent) {
          var reader = new FileReader();

          reader.onloadend = function(event) {
            var barcodeData = event.target.result.split("\n");
            if (barcodeData[barcodeData.length - 1].trim().length === 0) {
              barcodeData.pop();
            }

            $("#haigy-barcode-show-today-data-link-wrapper").hide();
            $("#haigy-barcode-today-data").html(barcodeData.reverse().join("<br><br>"));
          };

          reader.readAsText(fileContent);
        },

        function(error) {
          console.log(["error: fail to read the file. (", error.code, ")"].join(""));
        }
      );
    });
  },


  operateTodayBarcodeFile: function(functionToOperateFile) {
    var getFileSuccessCallback = function(file) {
      functionToOperateFile(file);
    };

    var getDirectorySuccessCallback = function(directory) {
      var today = new Date();
      var todayMonth = today.getMonth() + 1;
      if (todayMonth < 10) {
        todayMonth = "0" + todayMonth;
      }
      var todayDate = today.getDate();
      if (todayDate < 10) {
        todayDate = "0" + todayDate;
      }
      var filename = ["barcode_", today.getFullYear(), "_", todayMonth, "_", todayDate, ".txt"].join("");

      directory.getFile(
        filename,
        {create: true, exclusive: false},
        getFileSuccessCallback,
        function(error) {
          console.log(["error: fail to get the file. (", error.code, ")"].join(""));
        }
      );
    };

    var requestFileSystemSuccessCallback = function(fileSystem) {
      var root = fileSystem.root;
      root.getDirectory(
        "HaigyBarcodeCollector",
        {create: true, exclusive: false},
        getDirectorySuccessCallback,
        function(error) {
          console.log(["error: fail to get HaigyBarcodeCollector directory. (", error.code, ")"].join(""));
        }
      );
    };

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, requestFileSystemSuccessCallback, function(error) {
      console.log(["error: fail to get the file system. (", error.code, ")"].join(""));
    });
  }
};


haigyBarcodeCollector.initialize();