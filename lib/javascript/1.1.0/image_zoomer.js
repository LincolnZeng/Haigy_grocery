/*!
  developed from Wheelzoom 3.0.3
  license: MIT
  http://www.jacklmoore.com/wheelzoom
*/


// required libraries: "underscore.js", "jQuery" and "hammer.js"
modulejs.define("haigy/lib/1.1.0/image_zoomer", ["underscore", "jquery", "hammer"], function(_, $, Hammer) {
  "use strict";


  var ImageZoomer = function($imageElement, options) {
    var that = this;

    _.bindAll(that, "resize");

    that.$imageElement = $imageElement;

    var customOptions = options || {};
    that.listenToWindowResize = customOptions.listenToWindowResize === true;
    that.mouseWheelZoomSpeed = customOptions.mouseWheelZoomSpeed || 0.3;
    that.pinchZoomSpeed = customOptions.pinchZoomSpeed || 0.05;
    that.maxZoomInScale = customOptions.maxZoomInScale || 10;
    that.eventListenInterval = customOptions.eventListenInterval || 16;   // in millisecond
    that.maxZoomInCallback = customOptions.maxZoomInCallback || function() {};
    that.maxZoomOutCallback = customOptions.maxZoomOutCallback || function() {};

    that.previousEvent = null;
    that.lastEventTime = Date.now();

    that.width = 0;
    that.height = 0;
    that.bgWidth = 0;
    that.bgHeight = 0;
    that.bgPosX = 0;
    that.bgPosY = 0;

    that.hammerManager = new Hammer.Manager($imageElement.get(0));
    var hammerPan = new Hammer.Pan();
    var hammerPinch = new Hammer.Pinch();
    that.hammerManager.add(hammerPan);
    that.hammerManager.add(hammerPinch);

    if (that.$imageElement.get(0).complete) {
      that.imageLoaded();
    } else {
      that.$imageElement.one("load", function() {
        that.imageLoaded();
      });
    }
  };


  ImageZoomer.prototype.imageLoaded = function() {
    var that = this;

    var $image = that.$imageElement;
    that.width = parseInt($image.width(), 10);
    that.height = parseInt($image.height(), 10);
    that.bgWidth = that.width;
    that.bgHeight = that.height;
    that.bgPosX = 0;
    that.bgPosY = 0;

    $image.css({
      "background-image": ["url('", $image.attr("src"), "')"].join(""),
      "background-repeat": "no-repeat",
      "background-size": [that.width, "px ", that.height, "px"].join(""),
      "background-position": "0 0"
    });

    var canvas = document.createElement("canvas");
    canvas.width = $image.width();
    canvas.height = $image.height();
    $image.attr("src", canvas.toDataURL());

    if (that.listenToWindowResize) {
      $(window).on("resize", that.resize);
    }

    $image.on("wheel", function(event) {
      that.zoom(event.originalEvent, that.mouseWheelZoomSpeed);
    });

    that.hammerManager.on("panstart", function(hammerEvent) {
      var currentTime = Date.now();
      if (currentTime - that.lastEventTime > that.eventListenInterval) {
        hammerEvent.pageX = hammerEvent.center.x;
        hammerEvent.pageY = hammerEvent.center.y;
        that.previousEvent = hammerEvent;
        that.lastEventTime = currentTime;
      }
    });

    that.hammerManager.on("panmove", function(hammerEvent) {
      var currentTime = Date.now();
      if (currentTime - that.lastEventTime > that.eventListenInterval) {
        hammerEvent.pageX = hammerEvent.center.x;
        hammerEvent.pageY = hammerEvent.center.y;
        that.drag(hammerEvent);
        that.lastEventTime = currentTime;
      }
    });

    that.hammerManager.on("pinchin", function(hammerEvent) {
      var currentTime = Date.now();
      if (currentTime - that.lastEventTime > that.eventListenInterval) {
        hammerEvent.pageX = hammerEvent.center.x;
        hammerEvent.pageY = hammerEvent.center.y;
        hammerEvent.deltaY = 1;   // positive value will make picture smaller
        that.zoom(hammerEvent, that.pinchZoomSpeed);
        that.lastEventTime = currentTime;
      }
    });

    that.hammerManager.on("pinchout", function(hammerEvent) {
      var currentTime = Date.now();
      if (currentTime - that.lastEventTime > that.eventListenInterval) {
        hammerEvent.pageX = hammerEvent.center.x;
        hammerEvent.pageY = hammerEvent.center.y;
        hammerEvent.deltaY = -1;   // negative value will make picture larger
        that.zoom(hammerEvent, that.pinchZoomSpeed);
        that.lastEventTime = currentTime;
      }
    });
  };


  ImageZoomer.prototype.updateImageBackgroundStyle = function() {
    if (this.bgPosX > 0) {
      this.bgPosX = 0;
    } else if (this.bgPosX < this.width - this.bgWidth) {
      this.bgPosX = this.width - this.bgWidth;
    }

    if (this.bgPosY > 0) {
      this.bgPosY = 0;
    } else if (this.bgPosY < this.height - this.bgHeight) {
      this.bgPosY = this.height - this.bgHeight;
    }

    this.$imageElement.css({
      "background-size": [this.bgWidth, "px ", this.bgHeight, "px"].join(""),
      "background-position": [this.bgPosX, "px ", this.bgPosY, "px"].join("")
    });
  };


  ImageZoomer.prototype.resetBackground = function() {
    this.bgWidth = this.width;
    this.bgHeight = this.height;
    this.bgPosX = 0;
    this.bgPosY = 0;
    this.updateImageBackgroundStyle();
  };


  ImageZoomer.prototype.resize = function() {
    var $image = this.$imageElement;
    this.width = parseInt($image.width(), 10);
    this.height = parseInt($image.height(), 10);
    var canvas = document.createElement("canvas");
    canvas.width = $image.width();
    canvas.height = $image.height();
    $image.attr("src", canvas.toDataURL());
    this.resetBackground();
  };


  ImageZoomer.prototype.drag = function(event) {
    event.preventDefault();
    this.bgPosX += (event.pageX - this.previousEvent.pageX);
    this.bgPosY += (event.pageY - this.previousEvent.pageY);
    this.previousEvent = event;
    this.updateImageBackgroundStyle();
  };


  ImageZoomer.prototype.zoom = function(event, customZoomSpeed) {
    event.preventDefault();
    var deltaY = 0;

    if (event.deltaY) { // FireFox 17+ (IE9+, Chrome 31+?)
      deltaY = event.deltaY;
    } else if (event.wheelDelta) {
      deltaY = -event.wheelDelta;
    }

    // As far as I know, there is no good cross-browser way to get the cursor position relative to the event target.
    // We have to calculate the target element's position relative to the document, and subtrack that from the
    // cursor's position relative to the document.
    var rect = this.$imageElement.get(0).getBoundingClientRect();
    var offsetX = event.pageX - rect.left - window.pageXOffset;
    var offsetY = event.pageY - rect.top - window.pageYOffset;

    // Record the offset between the bg edge and cursor:
    var bgCursorX = offsetX - this.bgPosX;
    var bgCursorY = offsetY - this.bgPosY;

    // Use the previous offset to get the percent offset between the bg edge and cursor:
    var bgRatioX = bgCursorX / this.bgWidth;
    var bgRatioY = bgCursorY / this.bgHeight;

    // Update the background size:
    if (deltaY < 0) {
      if (this.width * this.maxZoomInScale > this.bgWidth) {
        this.bgWidth += this.bgWidth * customZoomSpeed;
        this.bgHeight += this.bgHeight * customZoomSpeed;
      } else {
        this.maxZoomInCallback();
      }
    } else {
      this.bgWidth -= this.bgWidth * customZoomSpeed;
      this.bgHeight -= this.bgHeight * customZoomSpeed;
    }

    // Take the percent offset and apply it to the new size:
    this.bgPosX = offsetX - (this.bgWidth * bgRatioX);
    this.bgPosY = offsetY - (this.bgHeight * bgRatioY);

    // Prevent zooming out beyond the starting size
    if (this.bgWidth <= this.width || this.bgHeight <= this.height) {
      this.resetBackground();
      this.maxZoomOutCallback();
    } else {
      this.updateImageBackgroundStyle();
    }
  };


  // remove all event listeners to prevent memory leak
  ImageZoomer.prototype.destroy = function() {
    $(window).off("resize", this.resize);
    this.$imageElement.off("load");
    this.hammerManager.destroy();
    this.$imageElement.off("wheel");
  };


  return ImageZoomer;
});
