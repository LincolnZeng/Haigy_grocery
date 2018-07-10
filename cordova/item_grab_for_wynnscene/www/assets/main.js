var APP_DIRECTORY_NAME = "HaigyItemGrabForWynnscene";
var ITEM_DETAILS_FILE = "item_details.txt";
var SYNC_LIST_DIRECTORY = "_sync_list_";
var IMAGE_FILE_EXTENSION = ".jpg";


function getItemDirectoryNameFromBarcode(barcode, barcodeType) {
  return [barcode.trim(), "_", barcodeType.trim()].join("").toLowerCase();
}


function getAllEntriesInDirectory(dirEntry, successCallback, errorCallback) {
  var dirReader = dirEntry.createReader();
  var allEntries = [];

  // There is no guarantee that all of a directory's entries will be returned in a single call to readEntries().
  // Call the reader.readEntries() until no more results are returned.
  var readEntries = function() {
     dirReader.readEntries(function(results) {
      if (results.length > 0) {
        allEntries = allEntries.concat(Array.prototype.slice.call(results || [], 0));
        readEntries();
      } else {
        successCallback(allEntries.sort(function(entryA, entryB){return (entryA.name < entryB.name ? -1 : 1);}));
      }
    }, errorCallback);
  };

  readEntries(); // Start reading dirs.
}


function getSyncItemEntryId(itemDirectoryName) {
  return ["haigy-ig-sync-item-entry-", itemDirectoryName].join("");
}


var haigyItemGrab = {
  // Application Constructor
  initialize: function() {
    _.bindAll(this, "onDeviceReady");
    _.bindAll(this, "takePicture");
    _.bindAll(this, "scanSuccessCallback");

    document.addEventListener('deviceready', this.onDeviceReady, false);
  },


  onDeviceReady: function() {
    var that = this;

    $(function() {
      var mainContainer = $("#haigy-ig-main-container");

      mainContainer.on("click", ".haigy-ig-sync-all-with-database", function(event) {
        event.preventDefault();
        that.showSyncAllWithDatabasePage();
      });

      mainContainer.on("click", ".haigy-ig-sync-next-item", function(event) {
        event.preventDefault();
        var syncItem = $(event.currentTarget);
        that.showNextSyncItem(syncItem.data("itemDirectoryName"));
      });

      mainContainer.on("click", ".haigy-ig-sync-current-item", function(event) {
        event.preventDefault();
        var syncItem = $(event.currentTarget);
        that.syncCurrentItem(syncItem.data("itemDirectoryName"));
      });

      mainContainer.on("click", ".haigy-ig-new-item", function(event) {
        event.preventDefault();
        var element = $(event.currentTarget);
        that.showItemEditForm({barcode: element.data("barcode"), barcode_type: element.data("barcodeType")});
      });

      mainContainer.on("click", ".haigy-ig-back-to-home", function(event) {
        event.preventDefault();
        that.showHomePage();
      });

      mainContainer.on("click", ".haigy-ig-start-barcode-scan", function(event) {
        event.preventDefault();
        that.startBarcodeScan();
      });

      mainContainer.on("click", ".haigy-ig-show-item-list", function(event) {
        event.preventDefault();
        that.showItemList();
      });

      mainContainer.on("click", ".haigy-ig-show-item-details", function(event) {
        event.preventDefault();
        var element = $(event.currentTarget);
        that.showItemDetails(element.data("itemDirectoryName"));
      });

      mainContainer.on("click", ".haigy-ig-item-show-all-images", function(event) {
        event.preventDefault();
        var element = $(event.currentTarget);
        that.showAllItemImages(element.data("itemDirectoryName"));
      });

      mainContainer.on("click", ".haigy-ig-delete-item", function(event) {
        event.preventDefault();
        if (confirm("Are you sure to delete this item?")) {
          var element = $(event.currentTarget);
          that.deleteItem(element.data("itemDirectoryName"));
        }
      });

      mainContainer.on("click", ".haigy-ig-edit-item", function(event) {
        event.preventDefault();
        var element = $(event.currentTarget);
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
          that.readItemDetails(fileSystem, element.data("itemDirectoryName"), function(detailsObject) {
            that.showItemEditForm(detailsObject);
          });
        });
      });

      mainContainer.on("click", ".haigy-ig-item-edit-form-save", function() {
        that.onClickItemEditFormSaveButton();
      });

      mainContainer.on("click", ".haigy-ig-take-picture", function(event) {
        event.preventDefault();
        var element = $(event.currentTarget);
        that.takePicture(element.data("itemDirectoryName"));
      });

      mainContainer.on("click", ".haigy-ig-item-image-delete", function(event) {
        event.preventDefault();
        if (confirm("Are you sure to delete this image?")) {
          var element = $(event.currentTarget);
          that.deleteItemPicture(element.data("itemDirectoryName"), element.data("imageFileName"));
        }
      });

      that.showHomePage();
    });
  },


  hideAllContainers: function() {
    $("#haigy-ig-sync-all-with-database-container").hide();
    $("#haigy-ig-home-container").hide();
    $("#haigy-ig-item-list-container").hide();
    $("#haigy-ig-new-item-container").hide();
    $("#haigy-ig-item-edit-form-container").hide();
    $("#haigy-ig-item-details-container").hide();
  },


  addToSyncList: function(itemDirectoryName, successCallback, errorCallback) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function() {
        fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", SYNC_LIST_DIRECTORY].join(""), {create: true, exclusive: false}, function(dirEntry) {
          var fileName = itemDirectoryName;
          fileSystem.root.getFile([APP_DIRECTORY_NAME, "/", SYNC_LIST_DIRECTORY, "/", fileName].join(""), {create: true, exclusive: false}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {
              fileWriter.onwrite = function() {
                if (successCallback) {
                  successCallback();
                }
              };
              fileWriter.onerror = function() {
                if (errorCallback) {
                  errorCallback();
                }
              };
              fileWriter.write("need to synchronize with database");
            }, errorCallback);
          });
        });
      });
    });
  },


  removeFromSyncList: function(itemDirectoryName, successCallback, errorCallback) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function() {
        fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", SYNC_LIST_DIRECTORY].join(""), {create: true, exclusive: false}, function(dirEntry) {
          var fileName = itemDirectoryName;
          fileSystem.root.getFile([APP_DIRECTORY_NAME, "/", SYNC_LIST_DIRECTORY, "/", fileName].join(""), {create: false, exclusive: false}, function(fileEntry) {
            fileEntry.remove(successCallback, errorCallback);
          });
        });
      });
    });
  },


  showNextSyncItem: function(itemDirectoryName) {
    $("#haigy-ig-sync-notice-message").empty();
    $(["#", getSyncItemEntryId(itemDirectoryName)].join("")).remove();
    var allOtherSyncItemContainers = $(".haigy-ig-sync-item-entry");
    if (allOtherSyncItemContainers.length > 0) {
      allOtherSyncItemContainers.first().show();
    } else {
      $("#haigy-ig-sync-no-more-item-message").show();
    }
  },


  syncCurrentItem: function(itemDirectoryName) {
    var that = this;

    var currentItemContainer = $(["#", getSyncItemEntryId(itemDirectoryName)].join(""));
    var syncMessageContainer =  $("#haigy-ig-sync-notice-message");

    currentItemContainer.hide();
    syncMessageContainer.empty();
    syncMessageContainer.append("<div>Synchronizing ...</div><br>");
    syncMessageContainer.show();

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      that.readItemDetails(fileSystem, itemDirectoryName, function(detailsObject) {
        var syncData = {
          key: "j##nlaewnofaoeda@fdsafdgsfg323rzfepRfdsomvdlfmwdas**2ds*231385",
          item_id: detailsObject.database_item_id,
          name: detailsObject.name,
          size: detailsObject.size,
          barcode: detailsObject.barcode,
          barcode_type: detailsObject.barcode_type,
          in_stock: detailsObject.in_stock,
          purchase_unit: detailsObject.purchase_unit,
          price: detailsObject.price,
          is_organic: detailsObject.is_organic
        };

        $.ajax({
          type: "POST",
          url: "http://192.168.0.12:3001/store_item_infos/updateFromHaigyItemGrab",
          data: syncData,
          success: function(responseData, textStatus, jqXHR) {
            currentItemContainer.remove();
            syncMessageContainer.empty();
            if (responseData.success === "yes") {
              if (detailsObject.database_item_id !== responseData.item_id.toString()) {
                detailsObject.database_item_id = responseData.item_id.toString();
                that.writeItemDetails(detailsObject, false);
              }

              that.removeFromSyncList(itemDirectoryName, function() {
                syncMessageContainer.append("<div>Sync Success!</div><br>");
                syncMessageContainer.append(["<div><button class='haigy-ig-sync-next-item' data-item-directory-name='",
                  itemDirectoryName, "'>Next Item</button>"
                ].join(""));
              });
            } else {
              syncMessageContainer.append("<div>Sync failed:</div>");
              syncMessageContainer.append(["<div>", responseData.error_message, "</div><br>"].join(""));
              syncMessageContainer.append(["<div><button class='haigy-ig-show-item-details' data-item-directory-name='",
                itemDirectoryName, "'>See Item Details</button> ",
                "<button class='haigy-ig-sync-next-item' data-item-directory-name='",
                itemDirectoryName, "'>Next Item</button>"
              ].join(""));
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            alert("Sync failed. Unknown error.");
            syncMessageContainer.hide();
            currentItemContainer.show();
          },
          dataType: "json"
        });
      });
    });
  },


  showSyncAllWithDatabasePage: function() {
    var that = this;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function() {
        fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", SYNC_LIST_DIRECTORY].join(""), {create: true, exclusive: false}, function(dirEntry) {
          getAllEntriesInDirectory(dirEntry, function(syncListEntries) {
            that.hideAllContainers();
            var syncContainer = $("#haigy-ig-sync-all-with-database-container");
            syncContainer.empty();
            syncContainer.append("<br><div><h3><i>Synchronizing with Database</i></h3></div>");
            syncContainer.append("<div><a class='haigy-ig-back-to-home' href='#'>Back to Home</a></div><br><br><br>");
            syncContainer.append("<div id='haigy-ig-sync-notice-message' class='haigy-hide'></div>");
            syncContainer.append("<div id='haigy-ig-sync-no-more-item-message' class='haigy-hide'>No more item needs to be synchronized.</div>");
            syncContainer.show();

            var entryCount = syncListEntries.length;
            if (entryCount > 0) {
              for (var entryIndex = 0; entryIndex < entryCount; ++entryIndex) {
                var itemDirectoryName = syncListEntries[entryIndex].name;

                that.readItemDetails(fileSystem, itemDirectoryName, function(detailsObject, callbackItemDirectoryName) {
                  var itemDiv = $(["<div id='",
                    getSyncItemEntryId(callbackItemDirectoryName),
                    "' class='haigy-hide haigy-ig-sync-item-entry'></div>"
                  ].join(""));
                  itemDiv.append(["<div>item: <i><a href='#' class='haigy-ig-show-item-details' data-item-directory-name='",
                    callbackItemDirectoryName, "'>", detailsObject.name, "</a></i></div>"
                  ].join(""));
                  itemDiv.append(["<div>size: <i>", detailsObject.size, "</i></div>"].join(""));
                  itemDiv.append(["<div>",
                    (detailsObject.in_stock === "yes" ? "<span class='haigy-font-green'>In Stock</span>" : "<span class='haigy-font-red'>Out of Stock</span>"),
                    "</div><br>"
                  ].join(""));
                  itemDiv.append(["<div>barcode: <i>", detailsObject.barcode, "</i></div>"].join(""));
                  itemDiv.append(["<div>barcode type: <i>", detailsObject.barcode_type, "</i></div><br>"].join(""));
                  itemDiv.append(["<div>purchase unit: <i>", detailsObject.purchase_unit, "</i></div>"].join(""));
                  itemDiv.append(["<div>price: <i>$", detailsObject.price, "</i></div><br>"].join(""));
                  itemDiv.append(["<div>is organic: <i>", detailsObject.is_organic, "</i></div><br>"].join(""));
                  itemDiv.append(["<div><button class='haigy-ig-sync-next-item' data-item-directory-name='", callbackItemDirectoryName, "'>Not Now and Next Item</button> ",
                    "<button class='haigy-ig-sync-current-item' data-item-directory-name='", callbackItemDirectoryName, "'>Correct and Synchronize</button></div><br>"
                  ].join(""));
                  syncContainer.append(itemDiv);
                  $(".haigy-ig-sync-item-entry").first().show();
                });
              }
            } else {
              $("#haigy-ig-sync-no-more-item-message").show();
            }
          });
        });
      });
    });
  },


  showHomePage: function() {
    this.hideAllContainers();
    $("#haigy-ig-home-container").show();
  },


  startBarcodeScan: function() {
    var that = this;

    cordova.exec(
      that.scanSuccessCallback,
      function(error) {   // error call back
        var errorMessage = ["Scan Failed: ", error].join("");
        console.log(errorMessage);
        alert(errorMessage);
      },
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


  scanSuccessCallback: function(scanResultArray) {
    var that = this;

    var barcode = scanResultArray[0];
    var barcodeType = scanResultArray[1] || "unknown";
    var itemDirectoryName = getItemDirectoryNameFromBarcode(barcode, barcodeType);

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getFile(
        [APP_DIRECTORY_NAME, "/", itemDirectoryName, "/", ITEM_DETAILS_FILE].join(""),
        {create: false, exclusive: false},
        function() {   // file exists
          that.showItemDetails(itemDirectoryName);
        },
        function() {   // file does not exist
          that.hideAllContainers();
          var newItemContainer = $("#haigy-ig-new-item-container");
          newItemContainer.empty();
          newItemContainer.append(["<br><h3>Cannot find item: ", itemDirectoryName].join(""));
          newItemContainer.append("<br>");
          newItemContainer.append([
            "<div><a href='#' class='haigy-ig-new-item' data-barcode='",
            barcode,"' data-barcode-type='", barcodeType, "'>Create a new item</a></div>"
          ].join(""));
          newItemContainer.show();
        }
      );
    });
  },


  showItemList: function() {
    var that = this;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function(dirEntry) {
        getAllEntriesInDirectory(dirEntry, function(allEntries) {
          var itemListContainer = $("#haigy-ig-item-list-container");
          itemListContainer.empty();

          var entryCount = allEntries.length;
          var itemList = $("<ul></ul>");
          for (var index = 0; index < entryCount; ++index) {
            var itemDirectoryName = allEntries[index].name;

            if (itemDirectoryName !== SYNC_LIST_DIRECTORY) {
              itemList.append([
                "<li><span class='haigy-ig-edit-item ", ["haigy-ig-item-", itemDirectoryName, "-price"].join(""),
                "' data-item-directory-name='", itemDirectoryName,
                "'></span><a href='#' class='haigy-ig-show-item-details' data-item-directory-name='",
                itemDirectoryName, "'><span class='",
                ["haigy-ig-item-", itemDirectoryName, "-name"].join(""),
                "'>loading the item name ...</span></a></li>"
              ].join(""));
              that.readItemDetails(fileSystem, itemDirectoryName, function(detailsObject, callbackItemDirectoryName) {
                var priceContainer = itemList.find([".haigy-ig-item-", callbackItemDirectoryName, "-price"].join(""));
                var nameContainer = itemList.find([".haigy-ig-item-", callbackItemDirectoryName, "-name"].join(""));
                if (detailsObject.in_stock === "yes") {
                  priceContainer.append(["[ $", detailsObject.price, " ", detailsObject.purchase_unit, " ] - "].join(""));
                } else {
                  priceContainer.append("[ <span class='haigy-font-red'>Out of Stock</span> ] - ");
                }
                nameContainer.html((detailsObject.name || "unknown item name"));
              });
            }
          }
          var listWrapper = $("<div></div>");
          listWrapper.append(itemList);

          itemListContainer.append(["<br><h3>Item List:</h3><br>"].join(""));
          itemListContainer.append(listWrapper);
          itemListContainer.show();
        });
      });
    });
  },


  createItemImageEntry: function(imageUrl, itemDirectoryName, imageFileName) {
    return ["<div><img src='",
      imageUrl,
      "' style='width: 280px;'> <a href='#' class='haigy-ig-item-image-delete' data-item-directory-name='",
      itemDirectoryName,
      "' data-image-file-name='",
      imageFileName,
      "'>Delete</a></div>"
    ].join("");
  },


  showItemDetails: function(itemDirectoryName) {
    var that = this;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      that.readItemDetails(fileSystem, itemDirectoryName, function(detailsObject, callbackItemDirectoryName) {
        that.hideAllContainers();
        var detailsContainer = $("#haigy-ig-item-details-container");
        detailsContainer.empty();
        var content = $("<div></div>");
        content.append("<h3>Item Details</h3>");
        content.append(["<div><a href='#' class='haigy-ig-back-to-home'>Back to Home</a></div><br><br>"].join(""));
        content.append(["<div><i>", (detailsObject.name || "unknown name" ), "</i></div>"].join(""));
        content.append(["<div>Size: ", detailsObject.size, "</div>"].join(""));
        content.append(["<div>",
          (detailsObject.in_stock === "yes" ? "<span class='haigy-font-green'>In Stock</span>" : "<span class='haigy-font-red'>Out of Stock</span>"),
          "</div>"
        ].join(""));
        content.append("<br>");
        content.append(["<div>Barcode: ", detailsObject.barcode, "</div>"].join(""));
        content.append(["<div>Barcode Type: ", detailsObject.barcode_type, "</div><br>"].join(""));
        content.append(["<div>Organic: ", detailsObject.is_organic, "</div><br>"].join(""));
        content.append(["<div>Price: $", detailsObject.price, " ", detailsObject.purchase_unit, "</div><br>"].join(""));
        var notes = detailsObject.notes;
        if (notes && notes.length > 0) {
          content.append(["<div>Notes: ", notes, "</div><br>"].join(""));
        }
        content.append(["<br><div><a href='#' class='haigy-ig-delete-item' data-item-directory-name='",
          callbackItemDirectoryName,
          "'>Delete</a> | <a href='#' class='haigy-ig-edit-item' data-item-directory-name='",
          callbackItemDirectoryName,
          "'>Edit</a> | <a href='#' class='haigy-ig-take-picture' data-item-directory-name='",
          callbackItemDirectoryName,
          "'>Take a Picture</a></div><br><br>"
        ].join(""));
        content.append("<div class='haigy-ig-item-images-container'></div>");
        content.append(["<div><a href='#' class='haigy-ig-item-show-all-images' data-item-directory-name='",
          callbackItemDirectoryName,
          "'>Show all pictures</a></div><br><br>"
        ].join(""));
        detailsContainer.append(content);
        detailsContainer.show();
      });
    });
  },


  showAllItemImages: function(itemDirectoryName) {
    var that = this;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", itemDirectoryName].join(""), {create: false, exclusive: false}, function(dirEntry) {
        getAllEntriesInDirectory(dirEntry, function(allEntries) {
          var imageContainer = $(".haigy-ig-item-images-container");
          if (imageContainer.length > 0) {
            imageContainer.empty();
            var entryCount = allEntries.length;
            var imageCount = 0;
            for (var entryIndex = 0; entryIndex < entryCount; ++entryIndex) {
              var entry = allEntries[entryIndex];
              if (entry.isFile && entry.name.indexOf(IMAGE_FILE_EXTENSION) > 0) {
                ++imageCount;
                imageContainer.append(that.createItemImageEntry(entry.toURL(), itemDirectoryName, entry.name));
              }
            }
            if (imageCount === 0) {
              alert("no image to show");
            }
          }
        });
      });
    });
  },


  deleteItem: function(itemDirectoryName, successCallback) {
    var that = this;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", itemDirectoryName].join(""), {create: false, exclusive: false}, function(detailsDirEntry) {
        detailsDirEntry.removeRecursively(function() {
          that.removeFromSyncList(itemDirectoryName);
          that.showHomePage();
        });
      });
    });
  },


  showItemEditForm: function(itemDetailsObject) {
    var editFormContainer = $("#haigy-ig-item-edit-form-container");

    var content = $("<div></div>");
    var detailsObject = itemDetailsObject || {};

    if (itemDetailsObject && itemDetailsObject.modify_time) {
      content.append("<h3>Edit Item</h3>");
    } else {
      content.append("<h3>New Item</h3>");
    }
    content.append("<div><a href='#' class='haigy-ig-back-to-home'>Back to Home</a></div><br><br>");

    content.append(["<div>Item Name: <input id='haigy-ig-item-edit-form-name' type='text' value='",
      detailsObject.name,
      "'></div>"
    ].join(""));

    content.append(["<div>Size: <input id='haigy-ig-item-edit-form-size' type='text' value='", detailsObject.size, "'></div><br>"].join(""));

    content.append(["<input id='haigy-ig-item-edit-form-database-item-id' type='hidden' value='",
      detailsObject.database_item_id, "'>"
    ].join(""));

    content.append(["<div>Barcode: ", detailsObject.barcode,
      "</div><input id='haigy-ig-item-edit-form-barcode' type='hidden' value='",
      detailsObject.barcode, "'>"
    ].join(""));

    content.append(["<div>Barcode Type: ", detailsObject.barcode_type,
      "</div><input id='haigy-ig-item-edit-form-barcode-type' type='hidden' value='",
      detailsObject.barcode_type, "'><br>"
    ].join(""));

    content.append(["<div><input id='haigy-ig-item-edit-form-in-stock' type='checkbox'",
      (detailsObject.in_stock === "no" ? "" : " checked"),
      "> <label for='haigy-ig-item-edit-form-in-stock'>In Stock</label></div>"
    ].join(""));

    content.append(["<div><input id='haigy-ig-item-edit-form-is-organic' type='checkbox'",
      (detailsObject.is_organic === "yes" ? " checked" : ""),
      "> <label for='haigy-ig-item-edit-form-is-organic'>Organic</label></div><br>"
    ].join(""));

    var purchaseUnit = detailsObject.purchase_unit || "each";
    content.append(["<div>Price: <input id='haigy-ig-item-edit-form-price' type='number' value='",
      detailsObject.price,
      "'> <select id='haigy-ig-item-edit-form-unit'>",
      "<option value='each'", (purchaseUnit === "each" ? " selected" : ""), ">each</option>",
      "<option value='per lb'", (purchaseUnit === "per lb" ? " selected" : ""), ">per lb</option>",
      "</select></div><br>"
    ].join(""));

    content.append(["<div>Notes:</div><div><textarea id='haigy-ig-item-edit-form-notes'>", detailsObject.notes, "</textarea></div><br><br>"].join(""));

    content.append("<div><button class='haigy-ig-item-edit-form-save'>Save</button></div><br><br>");

    this.hideAllContainers();
    editFormContainer.empty();
    editFormContainer.append(content);
    editFormContainer.show();
  },


  readItemDetails: function(fileSystem, itemDirectoryName, successCallback) {
    fileSystem.root.getFile([APP_DIRECTORY_NAME, "/", itemDirectoryName, "/", ITEM_DETAILS_FILE].join(""), {create: false, exclusive: false}, function(fileEntry) {
      fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function() {
          var itemDetailsObject = jsyaml.safeLoad(this.result);
          successCallback(itemDetailsObject, itemDirectoryName);
        };
        reader.readAsText(file);
      });
    });
  },


  writeItemDetails: function(detailsObject, addToSyncList) {
    var that = this;

    var itemDirectoryName = getItemDirectoryNameFromBarcode(detailsObject.barcode, detailsObject.barcode_type);
    var detailsYaml = jsyaml.safeDump(detailsObject);

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function() {
        fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", itemDirectoryName].join(""), {create: true, exclusive: false}, function() {
          fileSystem.root.getFile([APP_DIRECTORY_NAME, "/", itemDirectoryName, "/", ITEM_DETAILS_FILE].join(""), {create: true, exclusive: false}, function(fileEntry) {
            fileEntry.createWriter(function(fileWriter) {
              fileWriter.onwrite = function() {
                if (addToSyncList) {
                  that.addToSyncList(itemDirectoryName, function() {
                    that.hideAllContainers();
                    that.showItemDetails(itemDirectoryName);
                  });
                }
              };
              fileWriter.write(detailsYaml);
            });
          });
        });
      });
    });
  },


  onClickItemEditFormSaveButton: function() {
    var that = this;

    var detailsObject = {};
    detailsObject.barcode = $("#haigy-ig-item-edit-form-barcode").val().toLowerCase();
    detailsObject.barcode_type = $("#haigy-ig-item-edit-form-barcode-type").val().toLowerCase();
    var price = parseFloat($("#haigy-ig-item-edit-form-price").val());
    price = isNaN(price) ? 0.0 : price;

    if (detailsObject.barcode.length > 0 && detailsObject.barcode_type.length > 0 && price > 0.0) {
      detailsObject.name = $("#haigy-ig-item-edit-form-name").val().trim().toLowerCase();
      detailsObject.size = $("#haigy-ig-item-edit-form-size").val().trim();
      detailsObject.database_item_id = $("#haigy-ig-item-edit-form-database-item-id").val();
      detailsObject.in_stock = $("#haigy-ig-item-edit-form-in-stock").is(":checked") ? "yes" : "no";
      detailsObject.is_organic = $("#haigy-ig-item-edit-form-is-organic").is(":checked") ? "yes" : "no";
      detailsObject.price = price.toFixed(2);
      detailsObject.purchase_unit = $("#haigy-ig-item-edit-form-unit").val().trim().toLowerCase();
      detailsObject.notes = $("#haigy-ig-item-edit-form-notes").val().trim();
      detailsObject.modify_time = (new Date()).getTime().toString();

      that.writeItemDetails(detailsObject, true);
    } else {
      alert("The form is not well populated. Price and barcode are require fields.");
    }
  },


  deleteItemPicture: function(itemDirectoryName, imageFileName) {
    var that = this;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getFile([APP_DIRECTORY_NAME, "/", itemDirectoryName, "/", imageFileName].join(""), {create: false, exclusive: false}, function(fileEntry) {
        fileEntry.remove(function() {
          alert("The image is successfully deleted. All remaining images of this item will be shown.");
          that.showAllItemImages(itemDirectoryName);
        });
      });
    });
  },


  takePicture: function(itemDirectoryName) {
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
      var imageName = [(new Date()).getTime(), ".jpg"].join("");

      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
        fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function() {
          fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", itemDirectoryName].join(""), {create: true, exclusive: false}, function(directory) {
            entry.moveTo(directory, imageName,  successMove, resOnError);
          }, resOnError);
        }, resOnError);
      });
    }

    function successMove(entry) {
      var picturePreviewContainer = $(".haigy-ig-item-images-container");
      picturePreviewContainer.prepend(that.createItemImageEntry(entry.toURL(), itemDirectoryName, entry.name));
    }

    function resOnError(error) {
      alert(["Error: ", error.code].join(""));
    }

    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {quality: 100, destinationType: Camera.DestinationType.FILE_URI, saveToPhotoAlbum: true});
  }
};


haigyItemGrab.initialize();