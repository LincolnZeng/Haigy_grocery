var APP_DIRECTORY_NAME = "HaigyProduceGrab";
var PRODUCE_DETAILS_FILE = "item_details.txt";
var SYNC_LIST_DIRECTORY = "_sync_list_";
var IMAGE_FILE_EXTENSION = ".jpg";
var DEFAULT_WEIGHED_PIECES_COUNT = 5;
var DEFAULT_OLD_PRODUCE_NAME = "___";
var DEFAULT_OLD_VARIETY_DIR_NAME = "___";


function convertVarietyStringToDirName(produceVarietyString, hasSpecialName) {
  var dirName = produceVarietyString.replace(/\//g, "_OR_").replace(/\&/g, "_AND_").replace(/\'/g, "_SQUO_");
  if (hasSpecialName === true || hasSpecialName === "yes") {
    return ["_SPECIALNAME_", dirName].join("");
  } else {
    return dirName;
  }
}


function getNameFromItemDetailsObject(itemDetailsObject) {
  if (itemDetailsObject.variety === "none") {
    return itemDetailsObject.produce_name;
  } else {
    if (itemDetailsObject.has_special_name === "yes") {
      return itemDetailsObject.variety;
    } else {
      return [itemDetailsObject.variety, " ", itemDetailsObject.produce_name].join("");
    }
  }
}


function getNameFromVarietyDirName(produceName, varietyDirectoryName) {
  if (varietyDirectoryName === "none") {
    return produceName;
  } else {
    var variety = varietyDirectoryName.replace(/_SQUO_/g, "'").replace(/_AND_/g, "&").replace(/_OR_/g, "/");
    if (variety.indexOf("_SPECIALNAME_") === 0) {
      return variety.substring(13);
    } else {
      return [variety, " ", produceName].join("");
    }
  }
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


function getSyncItemEntryId(produceName, varietyDirName) {
  return ["haigy-pg-sync-item-entry-",
    produceName.replace(/\ /g, "_").replace(/\//g, "_OR_").replace(/\&/g, "_AND_").replace(/\'/g, "_SQUO_"), "-",
    varietyDirName.replace(/\ /g, "_")
  ].join("");
}


var haigyProduceGrab = {
  // Application Constructor
  initialize: function() {
    _.bindAll(this, "onDeviceReady");
    _.bindAll(this, "takePicture");

    document.addEventListener('deviceready', this.onDeviceReady, false);
  },


  onDeviceReady: function() {
    var that = this;

    $(function() {
      var mainContainer = $("#haigy-pg-main-container");

      mainContainer.on("click", ".haigy-pg-sync-all-with-database", function(event) {
        event.preventDefault();
        that.showSyncAllWithDatabasePage();
      });

      mainContainer.on("click", ".haigy-pg-sync-next-item", function(event) {
        event.preventDefault();
        var syncItem = $(event.currentTarget);
        that.showNextSyncItem(syncItem.data("produceName"), syncItem.data("varietyDirName"));
      });

      mainContainer.on("click", ".haigy-pg-sync-current-item", function(event) {
        event.preventDefault();
        var syncItem = $(event.currentTarget);
        that.syncCurrentItem(syncItem.data("produceName"), syncItem.data("varietyDirName"));
      });

      mainContainer.on("click", ".haigy-pg-new-produce-button", function(event) {
        event.preventDefault();
        that.showProduceEditForm();
      });

      mainContainer.on("click", ".haigy-pg-new-variety-button", function(event) {
        event.preventDefault();
        that.showProduceEditForm({produce_name: $(event.currentTarget).data("produceName")});
      });

      mainContainer.on("click", ".haigy-pg-back-to-home", function(event) {
        event.preventDefault();
        that.showHomePage();
      });

      mainContainer.on("click", ".haigy-pg-show-produce-variety-list", function(event) {
        event.preventDefault();
        that.showProduceVarietyList($(event.currentTarget).data("produceName"));
      });

      mainContainer.on("click", ".haigy-pg-show-produce-details", function(event) {
        event.preventDefault();
        var produceEntry = $(event.currentTarget);
        that.showProduceDetails(produceEntry.data("produceName"), produceEntry.data("varietyDirName"));
      });

      mainContainer.on("click", ".haigy-pg-produce-show-all-images", function(event) {
        event.preventDefault();
        var element = $(event.currentTarget);
        that.showAllProduceImages(element.data("produceName"), element.data("varietyDirName"));
      });

      mainContainer.on("click", ".haigy-pg-delete-produce", function(event) {
        event.preventDefault();
        if (confirm("Are you sure to delete this produce?")) {
          var produceEntry = $(event.currentTarget);
          that.deleteProduce(produceEntry.data("produceName"), produceEntry.data("varietyDirName"));
        }
      });

      mainContainer.on("click", ".haigy-pg-edit-produce", function(event) {
        event.preventDefault();
        var produceEntry = $(event.currentTarget);
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
          that.readProduceDetails(fileSystem, produceEntry.data("produceName"), produceEntry.data("varietyDirName"), function(detailsObject) {
            that.showProduceEditForm(detailsObject);
          });
        });
      });

      mainContainer.on("click", ".haigy-pg-produce-edit-form-save", function() {
        that.onClickProduceEditFormSaveButton();
      });

      mainContainer.on("click", ".haigy-pg-take-picture", function(event) {
        event.preventDefault();
        var element = $(event.currentTarget);
        that.takePicture(element.data("produceName"), element.data("varietyDirName"));
      });

      mainContainer.on("click", ".haigy-pg-produce-image-delete", function(event) {
        event.preventDefault();
        if (confirm("Are you sure to delete this image?")) {
          var element = $(event.currentTarget);
          that.deleteProducePicture(element.data("produceName"), element.data("varietyDirName"), element.data("imageFileName"));
        }
      });

      that.showHomePage();
    });
  },


  hideAllContainers: function() {
    $("#haigy-pg-sync-all-with-database-container").hide();
    $("#haigy-pg-produce-list-container").hide();
    $("#haigy-pg-produce-variety-list-container").hide();
    $("#haigy-pg-produce-edit-form-container").hide();
    $("#haigy-pg-produce-details-container").hide();
  },


  addToSyncList: function(produceName, varietyDirName, successCallback, errorCallback) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function() {
        fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", SYNC_LIST_DIRECTORY].join(""), {create: true, exclusive: false}, function(dirEntry) {
          var fileName = [produceName, varietyDirName].join("---");
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


  removeFromSyncList: function(produceName, varietyDirName, successCallback, errorCallback) {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function() {
        fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", SYNC_LIST_DIRECTORY].join(""), {create: true, exclusive: false}, function(dirEntry) {
          var fileName = [produceName, varietyDirName].join("---");
          fileSystem.root.getFile([APP_DIRECTORY_NAME, "/", SYNC_LIST_DIRECTORY, "/", fileName].join(""), {create: false, exclusive: false}, function(fileEntry) {
            fileEntry.remove(successCallback, errorCallback);
          });
        });
      });
    });
  },


  showNextSyncItem: function(currentProduceName, currentVarietyDirName) {
    $("#haigy-pg-sync-notice-message").empty();
    $(["#", getSyncItemEntryId(currentProduceName, currentVarietyDirName)].join("")).remove();
    var allOtherSyncItemContainers = $(".haigy-pg-sync-item-entry");
    if (allOtherSyncItemContainers.length > 0) {
      allOtherSyncItemContainers.first().show();
    } else {
      $("#haigy-pg-sync-no-more-item-message").show();
    }
  },


  syncCurrentItem: function(produceName, varietyDirName) {
    var that = this;

    var currentItemContainer = $(["#", getSyncItemEntryId(produceName, varietyDirName)].join(""));
    var syncMessageContainer =  $("#haigy-pg-sync-notice-message");

    currentItemContainer.hide();
    syncMessageContainer.empty();
    syncMessageContainer.append("<div>Synchronizing ...</div><br>");
    syncMessageContainer.show();

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      that.readProduceDetails(fileSystem, produceName, varietyDirName, function(detailsObject) {
        var syncData = {
          key: "example-key",
          item_id: detailsObject.database_item_id,
          item_name: detailsObject.name,
          in_stock: detailsObject.in_stock,
          purchase_unit: detailsObject.purchase_unit,
          price: detailsObject.price,
          estimated_weight_of_each_in_lb: detailsObject.estimated_weight_of_each_in_lb,
          is_organic: detailsObject.is_organic,
          is_seasonal: detailsObject.is_seasonal
        };

        $.ajax({
          type: "POST",
          url: "https://manage.haigy.com/store_item_infos/updateFromHaigyProduceGrab",
          data: syncData,
          success: function(responseData, textStatus, jqXHR) {
            currentItemContainer.remove();
            syncMessageContainer.empty();
            if (responseData.success === "yes") {
              if (detailsObject.database_item_id !== responseData.item_id.toString()) {
                detailsObject.database_item_id = responseData.item_id.toString();
                that.writeProduceDetails(detailsObject, false);
              }

              that.removeFromSyncList(produceName, varietyDirName, function() {
                syncMessageContainer.append("<div>Sync Success!</div><br>");
                syncMessageContainer.append(["<div><button class='haigy-pg-sync-next-item' data-produce-name='",
                  produceName, "' data-variety-dir-name='",
                  varietyDirName, "'>Next Item</button>"
                ].join(""));
              });
            } else {
              syncMessageContainer.append("<div>Sync failed:</div>");
              syncMessageContainer.append(["<div>", responseData.error_message, "</div><br>"].join(""));
              syncMessageContainer.append(["<div><button class='haigy-pg-show-produce-details' data-produce-name='",
                produceName, "' data-variety-dir-name='",
                varietyDirName, "'>See Item Details</button> ",
                "<button class='haigy-pg-sync-next-item' data-produce-name='",
                produceName, "' data-variety-dir-name='",
                varietyDirName, "'>Next Item</button>"
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
            var syncContainer = $("#haigy-pg-sync-all-with-database-container");
            syncContainer.empty();
            syncContainer.append("<br><div><h3><i>Synchronizing with Database</i></h3></div>");
            syncContainer.append("<div><a class='haigy-pg-back-to-home' href='#'>Back to Home</a></div><br><br><br>");
            syncContainer.append("<div id='haigy-pg-sync-notice-message' class='haigy-hide'></div>");
            syncContainer.append("<div id='haigy-pg-sync-no-more-item-message' class='haigy-hide'>No more item needs to be synchronized.</div>");
            syncContainer.show();

            var entryCount = syncListEntries.length;
            if (entryCount > 0) {
              for (var entryIndex = 0; entryIndex < entryCount; ++entryIndex) {
                var produceNameParts = syncListEntries[entryIndex].name.split("---");
                var produceName = produceNameParts[0];
                var varietiesDirEntry = produceNameParts[1];

                that.readProduceDetails(fileSystem, produceName, varietiesDirEntry, function(detailsObject, callbackProduceName, callbackVarietyDirName) {
                  var itemDiv = $(["<div id='",
                    getSyncItemEntryId(callbackProduceName, callbackVarietyDirName),
                    "' class='haigy-hide haigy-pg-sync-item-entry'></div>"
                  ].join(""));
                  itemDiv.append(["<div>produce: <i><a href='#' class='haigy-pg-show-produce-details' data-produce-name='",
                    callbackProduceName, "' data-variety-dir-name='",
                    callbackVarietyDirName, "'>", detailsObject.name, "</a></i></div>"
                  ].join(""));
                  itemDiv.append(["<div>",
                    (detailsObject.in_stock === "yes" ? "<span class='haigy-font-green'>In Stock</span>" : "<span class='haigy-font-red'>Out of Stock</span>"),
                    "</div><br>"
                  ].join(""));
                  itemDiv.append(["<div>purchase unit: <i>", detailsObject.purchase_unit, "</i></div>"].join(""));
                  itemDiv.append(["<div>price: <i>$", detailsObject.price, "</i></div><br>"].join(""));
                  itemDiv.append(["<div>estimated weight of each: <i>", detailsObject.estimated_weight_of_each_in_lb, " lb</i></div>"].join(""));
                  itemDiv.append(["<div><i>(weight of ", detailsObject.weighed_pieces_count, " pieces: ", detailsObject.total_weight_in_lb, " lb)<i></div><br>"].join(""));
                  itemDiv.append(["<div>is organic: <i>", detailsObject.is_organic, "</i></div>"].join(""));
                  itemDiv.append(["<div>is seasonal: <i>", detailsObject.is_seasonal, "</i></div><br>"].join(""));
                  itemDiv.append(["<div><button class='haigy-pg-sync-next-item' data-produce-name='", callbackProduceName,
                    "' data-variety-dir-name='", callbackVarietyDirName, "'>Not Now and Next Item</button> ",
                    "<button class='haigy-pg-sync-current-item' data-produce-name='", callbackProduceName,
                    "' data-variety-dir-name='", callbackVarietyDirName, "'>Correct and Synchronize</button></div><br>"
                  ].join(""));
                  syncContainer.append(itemDiv);
                  $(".haigy-pg-sync-item-entry").first().show();
                });
              }
            } else {
              $("#haigy-pg-sync-no-more-item-message").show();
            }
          });
        });
      });
    });
  },


  showHomePage: function() {
    var that = this;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function(dirEntry) {
        getAllEntriesInDirectory(dirEntry, function(allEntries) {
          that.hideAllContainers();
          var produceListContainer = $("#haigy-pg-produce-list-container");
          produceListContainer.empty();
          produceListContainer.append("<div><button class='haigy-pg-new-produce-button haigy-large-button'>New Produce</button></div><br>");

          var entryCount = allEntries.length;
          var produceList = $("<ul></ul>");
          for (var index = 0; index < entryCount; ++index) {
            var produceName = allEntries[index].name;
            if (produceName !== SYNC_LIST_DIRECTORY) {
              produceList.append(["<li class='haigy-pg-show-produce-variety-list' data-produce-name='", produceName, "'><a href='#'>", produceName,"</a></li>"].join(""));
            }
          }
          var listWrapper = $("<div></div>");
          listWrapper.append(produceList);

          produceListContainer.append("<br><h3>Produce List <small class='haigy-padding-l-15px'><i><a class='haigy-pg-sync-all-with-database' href='#'>Sync all with Database</a></i></small></h3><br>");
          produceListContainer.append(listWrapper);
          produceListContainer.show();
        });
      });
    });
  },


  showProduceVarietyList: function(produceName) {
    var that = this;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", produceName].join(""), {create: true, exclusive: false}, function(dirEntry) {
        getAllEntriesInDirectory(dirEntry, function(allEntries) {
          that.hideAllContainers();
          var varietyListContainer = $("#haigy-pg-produce-variety-list-container");
          varietyListContainer.empty();
          varietyListContainer.append(["<div><button class='haigy-pg-new-variety-button haigy-large-button' data-produce-name='", produceName, "'>New Variety</button></div><br>"].join(""));

          var entryCount = allEntries.length;
          var varietyList = $("<ul></ul>");
          for (var index = 0; index < entryCount; ++index) {
            var varietyDirName = allEntries[index].name;
            varietyList.append([
              "<li><span class='haigy-pg-edit-produce ", ["haigy-pg-produce-variety-", varietyDirName.replace(/\ /g, "_"), "-price"].join(""),
              "' data-produce-name='", produceName, "' data-variety-dir-name='", varietyDirName,
              "'></span><a href='#' class='haigy-pg-show-produce-details' data-produce-name='",
              produceName, "' data-variety-dir-name='", varietyDirName, "'>",
              getNameFromVarietyDirName(produceName, varietyDirName),
              "</a></li>"
            ].join(""));
            that.readProduceDetails(fileSystem, produceName, varietyDirName, function(detailsObject, callbackProduceName, callbackVarietyDirName) {
              var priceContainer = varietyList.find([".haigy-pg-produce-variety-",
                callbackVarietyDirName.replace(/\ /g, "_"),
                "-price"
              ].join(""));
              if (detailsObject.in_stock === "yes") {
                priceContainer.append(["[ $", detailsObject.price, " ", detailsObject.purchase_unit, " ] - "].join(""));
              } else {
                priceContainer.append("[ <span class='haigy-font-red'>Out of Stock</span> ] - ");
              }
            });
          }
          var listWrapper = $("<div></div>");
          listWrapper.append(varietyList);

          varietyListContainer.append(["<br><h3>Varieties for: ", produceName,"</h3><br>"].join(""));
          varietyListContainer.append(listWrapper);
          varietyListContainer.append("<div><br><a class='haigy-pg-back-to-home' href='#'>Back to Home</a></div>");
          varietyListContainer.show();
        });
      });
    });
  },


  createProduceImageEntry: function(imageUrl, produceName, varietyDirName, imageFileName) {
    return ["<div><img src='",
      imageUrl,
      "' style='width: 280px;'> <a href='#' class='haigy-pg-produce-image-delete' data-produce-name='",
      produceName,
      "' data-variety-dir-name='",
      varietyDirName,
      "' data-image-file-name='",
      imageFileName,
      "'>Delete</a></div>"
    ].join("");
  },


  showProduceDetails: function(produceName, varietyDirName) {
    var that = this;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      that.readProduceDetails(fileSystem, produceName, varietyDirName, function(detailsObject, callbackProduceName, callbackVarietyDirName) {
        that.hideAllContainers();
        var detailsContainer = $("#haigy-pg-produce-details-container");
        detailsContainer.empty();
        var content = $("<div></div>");
        content.append("<h3>Produce Details</h3>");
        content.append(["<div><a href='#' class='haigy-pg-back-to-home'>Back to Home</a> | <a href='#' class='haigy-pg-show-produce-variety-list' data-produce-name='", detailsObject.produce_name, "'>Back to Variety List</a></div><br><br>"].join(""));
        content.append(["<div><i>", getNameFromItemDetailsObject(detailsObject), "</i></div>"].join(""));
        content.append(["<div>",
          (detailsObject.is_seasonal === "yes" ? "Seasonal, ": ""),
          (detailsObject.in_stock === "yes" ? "<span class='haigy-font-green'>In Stock</span>" : "<span class='haigy-font-red'>Out of Stock</span>"),
          "</div>"
        ].join(""));
        content.append("<br>");
        content.append(["<div>Produce Name: ", detailsObject.produce_name, "</div><br>"].join(""));
        content.append(["<div>", (detailsObject.has_special_name === "yes" ? "Special Name: " : "Variety: "), detailsObject.variety, "</div><br>"].join(""));
        content.append(["<div>Organic: ", detailsObject.is_organic, "</div><br>"].join(""));
        content.append(["<div>Price: $", detailsObject.price, " ", detailsObject.purchase_unit, "</div><br>"].join(""));
        content.append(["<div>The weight of ", detailsObject.weighed_pieces_count, " pieces is ", detailsObject.total_weight_in_lb, " lb.</div><br>"].join(""));
        var labelCode = detailsObject.label_code;
        if (labelCode && labelCode.length > 0) {
          content.append(["<div>Label Code: ", labelCode, "</div><br>"].join(""));
        }
        var notes = detailsObject.notes;
        if (notes && notes.length > 0) {
          content.append(["<div>Notes: ", notes, "</div><br><br>"].join(""));
        }
        content.append(["<div><a href='#' class='haigy-pg-delete-produce' data-produce-name='",
          detailsObject.produce_name,
          "' data-variety-dir-name='", callbackVarietyDirName,
          "'>Delete</a> | <a href='#' class='haigy-pg-edit-produce' data-produce-name='",
          detailsObject.produce_name,
          "' data-variety-dir-name='", callbackVarietyDirName,
          "'>Edit</a> | <a href='#' class='haigy-pg-take-picture' data-produce-name='",
          detailsObject.produce_name,
          "' data-variety-dir-name='", callbackVarietyDirName, "'>Take a Picture</a></div><br><br>"
        ].join(""));
        content.append("<div class='haigy-pg-produce-images-container'></div>");
        content.append(["<div><a href='#' class='haigy-pg-produce-show-all-images' data-produce-name='",
          detailsObject.produce_name,
          "' data-variety-dir-name='", callbackVarietyDirName, "'>Show all pictures</a></div><br><br>"
        ].join(""));
        detailsContainer.append(content);
        detailsContainer.show();
      });
    });
  },


  showAllProduceImages: function(produceName, varietyDirName) {
    var that = this;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", produceName, "/", varietyDirName].join(""), {create: false, exclusive: false}, function(dirEntry) {
        getAllEntriesInDirectory(dirEntry, function(allEntries) {
          var imageContainer = $(".haigy-pg-produce-images-container");
          if (imageContainer.length > 0) {
            imageContainer.empty();
            var entryCount = allEntries.length;
            var imageCount = 0;
            for (var entryIndex = 0; entryIndex < entryCount; ++entryIndex) {
              var entry = allEntries[entryIndex];
              if (entry.isFile && entry.name.indexOf(IMAGE_FILE_EXTENSION) > 0) {
                ++imageCount;
                imageContainer.append(that.createProduceImageEntry(entry.toURL(), produceName, varietyDirName, entry.name));
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


  deleteProduce: function(produceName, varietyDirName, successCallback) {
    var that = this;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", produceName, "/", varietyDirName].join(""), {create: false, exclusive: false}, function(detailsDirEntry) {
        detailsDirEntry.removeRecursively(function() {
          that.removeFromSyncList(produceName, varietyDirName);

          fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", produceName].join(""), {create: false, exclusive: false}, function(varietiesDirEntry) {
            getAllEntriesInDirectory(varietiesDirEntry, function(allEntries) {
              if (allEntries.length > 0) {
                if (successCallback) {
                  successCallback();
                } else {
                  that.showProduceVarietyList(produceName);
                }
              } else {
                varietiesDirEntry.removeRecursively(function() {
                  if (successCallback) {
                    successCallback();
                  } else {
                    that.showHomePage();
                  }
                });
              }
            });
          });
        });
      });
    });
  },


  showProduceEditForm: function(produceDetailsObject) {
    var editFormContainer = $("#haigy-pg-produce-edit-form-container");

    var content = $("<div></div>");
    var detailsObject = produceDetailsObject || {};

    if (produceDetailsObject) {
      if (produceDetailsObject.variety) {
        content.append("<h3>Edit Produce</h3>");
      } else {
        content.append("<h3>New Variety</h3>");
      }
      content.append(["<div><a href='#' class='haigy-pg-back-to-home'>Back to Home</a> | <a href='#' class='haigy-pg-show-produce-variety-list' data-produce-name='", detailsObject.produce_name, "'>Back to Variety List</a></div><br><br>"].join(""));
    } else {
      content.append("<h3>New Produce</h3>");
      content.append("<div><a href='#' class='haigy-pg-back-to-home'>Back to Home</a></div><br><br>");
    }

    content.append(["<div>Produce Name: <input id='haigy-pg-produce-edit-form-produce-name' type='text' value='",
      detailsObject.produce_name,
      "'><input id='haigy-pg-produce-edit-form-old-produce-name' type='hidden' value='",
      (detailsObject.produce_name || DEFAULT_OLD_PRODUCE_NAME),
      "'></div>"
    ].join(""));

    content.append("<br>");

    content.append(["<div>Variety: <input id='haigy-pg-produce-edit-form-variety' type='text' value='",
      detailsObject.variety,
      "'><input id='haigy-pg-produce-edit-form-old-variety-dir-name' type='hidden' value='",
      (detailsObject.variety ? convertVarietyStringToDirName(detailsObject.variety, detailsObject.has_special_name) : DEFAULT_OLD_VARIETY_DIR_NAME),
      "'></div>"
    ].join(""));

    content.append(["<input id='haigy-pg-produce-edit-form-database-item-id' type='hidden' value='",
      detailsObject.database_item_id, "'>"
    ].join(""));

    content.append(["<div><input id='haigy-pg-produce-edit-form-has-special-name' type='checkbox'",
      (detailsObject.has_special_name === "yes" ? " checked" : ""),
      "> <label for='haigy-pg-produce-edit-form-has-special-name'>Has Special Name</label></div><br>"
    ].join(""));

    content.append(["<div><input id='haigy-pg-produce-edit-form-in-stock' type='checkbox'",
      (detailsObject.in_stock === "no" ? "" : " checked"),
      "> <label for='haigy-pg-produce-edit-form-in-stock'>In Stock</label></div>"
    ].join(""));
    content.append(["<div><input id='haigy-pg-produce-edit-form-is-seasonal' type='checkbox'",
      (detailsObject.is_seasonal === "yes" ? " checked" : ""),
      "> <label for='haigy-pg-produce-edit-form-is-seasonal'>Is Seasonal</label></div><br>"
    ].join(""));

    content.append(["<div><input id='haigy-pg-produce-edit-form-is-organic' type='checkbox'",
      (detailsObject.is_organic === "yes" ? " checked" : ""),
      "> <label for='haigy-pg-produce-edit-form-is-organic'>Organic</label></div><br>"
    ].join(""));

    var purchaseUnit = detailsObject.purchase_unit || "per lb";
    content.append(["<div>Price: <input id='haigy-pg-produce-edit-form-price' type='number' value='",
      detailsObject.price,
      "'> <select id='haigy-pg-produce-edit-form-unit'>",
      "<option value='per lb'", (purchaseUnit === "per lb" ? " selected" : ""), ">per lb</option>",
      "<option value='each'", (purchaseUnit === "each" ? " selected" : ""), ">each</option>",
      "<option value='per bunch'", (purchaseUnit === "per bunch" ? " selected" : ""), ">per bunch</option>",
      "</select></div><br>"
    ].join(""));

    var weighedPiecesCount = detailsObject.weighed_pieces_count || DEFAULT_WEIGHED_PIECES_COUNT;
    content.append(["<div>The weight of <input id='haigy-pg-produce-edit-form-weighed-pieces-count' type='number' value='",
      weighedPiecesCount,
      "'> pieces is <input id='haigy-pg-produce-edit-form-total-weight' type='number' value='",
      detailsObject.total_weight_in_lb,
    "'> lb.</div><br>"].join(""));

    content.append(["<div>Label Code: <input id='haigy-pg-produce-edit-form-label-code' type='text' value='", detailsObject.label_code, "'></div><br>"].join(""));

    content.append(["<div>Notes:</div><div><textarea id='haigy-pg-produce-edit-form-notes'>", detailsObject.notes, "</textarea></div><br><br>"].join(""));

    content.append("<div><button class='haigy-pg-produce-edit-form-save'>Save</button></div><br><br>");

    this.hideAllContainers();
    editFormContainer.empty();
    editFormContainer.append(content);
    editFormContainer.show();
  },


  readProduceDetails: function(fileSystem, produceName, varietyDirName, successCallback) {
    fileSystem.root.getFile([APP_DIRECTORY_NAME, "/", produceName, "/", varietyDirName, "/", PRODUCE_DETAILS_FILE].join(""), {create: false, exclusive: false}, function(fileEntry) {
      fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function() {
          var produceVarietyDetailsObject = jsyaml.safeLoad(this.result);
          successCallback(produceVarietyDetailsObject, produceName, varietyDirName);
        };
        reader.readAsText(file);
      });
    });
  },


  writeProduceDetails: function(detailsObject, addToSyncList) {
    var that = this;

    var produceName = detailsObject.produce_name;
    var varietyDirName = convertVarietyStringToDirName(detailsObject.variety, detailsObject.has_special_name);
    var detailsYaml = jsyaml.safeDump(detailsObject);

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function() {
        fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", produceName].join(""), {create: true, exclusive: false}, function() {
          fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", produceName, "/", varietyDirName].join(""), {create: true, exclusive: false}, function() {
            fileSystem.root.getFile([APP_DIRECTORY_NAME, "/", produceName, "/", varietyDirName, "/", PRODUCE_DETAILS_FILE].join(""), {create: true, exclusive: false}, function(fileEntry) {
              fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwrite = function() {
                  if (addToSyncList) {
                    that.addToSyncList(produceName, varietyDirName, function() {
                      that.hideAllContainers();
                      that.showProduceDetails(produceName, varietyDirName);
                    });
                  }
                };
                fileWriter.write(detailsYaml);
              });
            });
          });
        });
      });
    });
  },


  onClickProduceEditFormSaveButton: function() {
    var that = this;

    var detailsObject = {};
    detailsObject.produce_name = $("#haigy-pg-produce-edit-form-produce-name").val().trim().toLowerCase();
    detailsObject.variety = $("#haigy-pg-produce-edit-form-variety").val().trim().toLowerCase();
    var price = parseFloat($("#haigy-pg-produce-edit-form-price").val());
    price = isNaN(price) ? 0.0 : price;
    var weighedPiecesCount = parseInt($("#haigy-pg-produce-edit-form-weighed-pieces-count").val());
    weighedPiecesCount = isNaN(weighedPiecesCount) ? 0 : weighedPiecesCount;
    var totalWeightInLb = parseFloat($("#haigy-pg-produce-edit-form-total-weight").val());
    totalWeightInLb = isNaN(totalWeightInLb) ? 0.0 : totalWeightInLb;

    if (detailsObject.produce_name.length > 0 && detailsObject.variety.length > 0 && price > 0.0 && weighedPiecesCount > 0 && totalWeightInLb > 0.0) {
      detailsObject.database_item_id = $("#haigy-pg-produce-edit-form-database-item-id").val();
      detailsObject.in_stock = $("#haigy-pg-produce-edit-form-in-stock").is(":checked") ? "yes" : "no";
      detailsObject.is_seasonal = $("#haigy-pg-produce-edit-form-is-seasonal").is(":checked") ? "yes" : "no";
      detailsObject.is_organic = $("#haigy-pg-produce-edit-form-is-organic").is(":checked") ? "yes" : "no";
      detailsObject.has_special_name = $("#haigy-pg-produce-edit-form-has-special-name").is(":checked") ? "yes" : "no";
      detailsObject.price = price.toFixed(2);
      detailsObject.weighed_pieces_count = weighedPiecesCount;
      detailsObject.total_weight_in_lb = totalWeightInLb.toFixed(1);
      detailsObject.purchase_unit = $("#haigy-pg-produce-edit-form-unit").val().trim().toLowerCase();
      detailsObject.label_code = $("#haigy-pg-produce-edit-form-label-code").val().trim();
      detailsObject.notes = $("#haigy-pg-produce-edit-form-notes").val().trim();
      detailsObject.modify_time = (new Date()).getTime().toString();

      detailsObject.name = getNameFromItemDetailsObject(detailsObject);
      detailsObject.estimated_weight_of_each_in_lb = (totalWeightInLb / weighedPiecesCount).toFixed(2);

      var oldProduceName = $("#haigy-pg-produce-edit-form-old-produce-name").val();
      var oldVarietyDirName = $("#haigy-pg-produce-edit-form-old-variety-dir-name").val();
      var newVarietyDirName = convertVarietyStringToDirName(detailsObject.variety, detailsObject.has_special_name);

      if ((oldProduceName !== DEFAULT_OLD_PRODUCE_NAME && oldVarietyDirName !== DEFAULT_OLD_VARIETY_DIR_NAME) && (detailsObject.produce_name !== oldProduceName || newVarietyDirName !== oldVarietyDirName)) {

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
          // get old directory
          fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", oldProduceName, "/", oldVarietyDirName].join(""), {create: false, exclusive: false}, function(oldVarietyDirEntry) {

            // get new path
            fileSystem.root.getDirectory(APP_DIRECTORY_NAME, {create: true, exclusive: false}, function() {
              fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", detailsObject.produce_name].join(""), {create: true, exclusive: false}, function(newParentDirEntry) {

                // copy old direcotry to new path
                oldVarietyDirEntry.copyTo(newParentDirEntry, newVarietyDirName, function() {

                  // remove old directory
                  that.deleteProduce(oldProduceName, oldVarietyDirName, function() {

                    // update produce details in the new directory
                    that.writeProduceDetails(detailsObject, true);
                  });
                });
              });
            });
          });
        });
      } else {
        that.writeProduceDetails(detailsObject, true);
      }
    } else {
      alert("The form is not well populated.");
    }
  },


  deleteProducePicture: function(produceName, varietyDirName, imageFileName) {
    var that = this;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
      fileSystem.root.getFile([APP_DIRECTORY_NAME, "/", produceName, "/", varietyDirName, "/", imageFileName].join(""), {create: false, exclusive: false}, function(fileEntry) {
        fileEntry.remove(function() {
          alert("The image is successfully deleted. All remaining images of this produce will be shown.");
          that.showAllProduceImages(produceName, varietyDirName);
        });
      });
    });
  },


  takePicture: function(produceName, varietyDirName) {
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
          fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", produceName].join(""), {create: true, exclusive: false}, function() {
            fileSystem.root.getDirectory([APP_DIRECTORY_NAME, "/", produceName, "/", varietyDirName].join(""), {create: true, exclusive: false}, function(directory) {
              entry.moveTo(directory, imageName,  successMove, resOnError);
            }, resOnError);
          }, resOnError);
        }, resOnError);
      });
    }

    function successMove(entry) {
      var picturePreviewContainer = $(".haigy-pg-produce-images-container");
      picturePreviewContainer.prepend(that.createProduceImageEntry(entry.toURL(), produceName, varietyDirName, entry.name));
    }

    function resOnError(error) {
      alert(["Error: ", error.code].join(""));
    }

    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {quality: 100, destinationType: Camera.DestinationType.FILE_URI, saveToPhotoAlbum: true});
  }
};


haigyProduceGrab.initialize();