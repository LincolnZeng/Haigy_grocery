function getDateString() {
  var today = new Date();
  var todayMonth = today.getMonth() + 1;
  if (todayMonth < 10) {
    todayMonth = "0" + todayMonth;
  }
  var todayDate = today.getDate();
  if (todayDate < 10) {
    todayDate = "0" + todayDate;
  }
  return [today.getFullYear(), "_", todayMonth, "_", todayDate].join("");
}


function getBarcodeString(barcode, barcodeType) {
  return [barcode, "_", barcodeType].join("");
}


var haigyBarcodeCollector = {
  // Application Constructor
  initialize: function() {
    _.bindAll(this, "onDeviceReady");
    _.bindAll(this, "startScan");
    _.bindAll(this, "takePicture");
    _.bindAll(this, "scanSuccessCallback");

    document.addEventListener('deviceready', this.onDeviceReady, false);

    this.resetItemGrab;
  },


  resetItemGrab: function() {
    this.barcode = null;
    this.barcodeType = null;

    $("body").removeClass("haigy-background-error");
    $("#haigy-item-grab-picture-container").hide();
    $("#haigy-item-grab-picture-display").empty();
  },


  onDeviceReady: function() {
    var that = this;

    $(function() {
      $("#haigy-item-grab-take-picture").on("click", function() {
        that.takePicture();
      });

      $("#haigy-item-grab-start").on("click", function() {
        that.startScan();
      });

      $("#haigy-item-done").on("click", function() {
        that.resetItemGrab();
      });
    });
  },


  takePicture: function() {
    var that = this;

    function onPhotoDataSuccess(imageURL) {
      moveImage(imageURL);
    }

    function onFail(message) {
      alert('Failed because: ' + message);
    }

    function moveImage(imageURL){
      window.resolveLocalFileSystemURL(imageURL, resolveOnSuccess, resOnError);
    }

    //Callback function when the file system url has been resolved
    function resolveOnSuccess(entry){
      var today = new Date();
      var currentTime = today.getTime();
      var imageName = currentTime + ".jpg";
      var appFolderName = "HaigyItemGrab";
      var dateFolderName = [appFolderName, "/", getDateString()].join("");
      var barcodeFolderName = [dateFolderName, "/", getBarcodeString(that.barcode, that.barcodeType)].join("");

      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
        function(fileSystem) {
          fileSystem.root.getDirectory(appFolderName, {create: true, exclusive: false},
            function() {
              fileSystem.root.getDirectory(dateFolderName, {create: true, exclusive: false},
                function() {
                  fileSystem.root.getDirectory(barcodeFolderName, {create: true, exclusive: false},
                    function(directory) {
                      entry.moveTo(directory, imageName,  successMove, resOnError);
                    },
                    resOnError
                  );
                },
                resOnError
              );
            },
            resOnError
          );
        },
        resOnError
      );
    }

    function successMove(entry) {
      $("#haigy-item-grab-picture-display").html(['<img src="', entry.toURL(), '" style="width: 350px;">'].join(""));
    }

    function resOnError(error) {
      alert(["Error: ", error.code].join(""));
    }

    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {quality: 100, destinationType: Camera.DestinationType.FILE_URI, saveToPhotoAlbum: true});
  },


  startScan: function() {
    var that = this;

    that.resetItemGrab();

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

    if (that.barcodeType !== "upca" && that.barcodeType !== "UPC12") {
      $("body").addClass("haigy-background-error");
    }

    $("#haigy-item-grab-barcode").html(getBarcodeString(that.barcode, that.barcodeType));
    $("#haigy-item-grab-picture-container").show();
  },


  scanErrorCallback: function(error) {
    var errorMessage = ["Scan Failed: ", error].join("");
    console.log(errorMessage);
    alert(errorMessage);
  }
};


haigyBarcodeCollector.initialize();