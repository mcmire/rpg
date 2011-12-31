(function() {
  var Canvas, EventHelpers, collisionLayer, game;

  game = window.game;

  Canvas = game.Canvas, EventHelpers = game.EventHelpers;

  collisionLayer = game.util.module("game.collisionLayer", [EventHelpers]);

  collisionLayer.init = function(main) {
    var _this = this;
    this.main = main;
    if (!this.isInit) {
      this.isLoaded = false;
      this.viewport = this.main.viewport;
      this.width = this.viewport.width.pixels;
      this.height = this.viewport.height.pixels;
      this.imagePath = "" + this.main.imagesPath + "/mask.gif";
      this._loadImage(function() {});
      this.collisionBoxes = [
        {
          x1: 96,
          x2: 352,
          y1: 96,
          y2: 112
        }
      ];
      this.isInit = true;
    }
    return this;
  };

  collisionLayer.addEvents = function() {
    var self;
    return self = this;
  };

  collisionLayer.removeEvents = function() {};

  collisionLayer.attachTo = function(element) {};

  collisionLayer.detach = function() {};

  collisionLayer.add = function(bounds) {
    return this.collisionBoxes.push(bounds);
  };

  collisionLayer.draw = function() {
    var bom, positionStr;
    bom = this.viewport.frame.boundsOnMap;
    positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ");
    return this.$debugOverlay.css('background-position', positionStr);
  };

  collisionLayer.offsetToNotCollide = function(direction, bounds) {
    switch (direction) {
      case 'left':
        return bounds.x1 - this.getBlockingRightEdge(bounds);
      case 'right':
        return this.getBlockingLeftEdge(bounds) - bounds.x2;
      case 'up':
        return this.getBlockingBottomEdge(bounds) - bounds.y2;
      case 'down':
        return bounds.y1 - this.getBlockingTopEdge(bounds);
    }
  };

  collisionLayer.isIntersection = function(b) {
    var box, four, one, three, two, _i, _len, _ref, _ref2, _ref3, _ref4, _ref5;
    _ref = this.collisionBoxes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      box = _ref[_i];
      one = (box.x1 <= (_ref2 = b.x1) && _ref2 <= box.x2);
      two = (box.x1 <= (_ref3 = b.x2) && _ref3 <= box.x2);
      three = (box.y1 <= (_ref4 = b.y1) && _ref4 <= box.y2);
      four = (box.y1 <= (_ref5 = b.y2) && _ref5 <= box.y2);
      if ((one || two) && (three || four)) return true;
    }
    return false;
  };

  collisionLayer.getBlockingLeftEdge = function(b) {
    var box, _i, _len, _ref, _ref2, _ref3, _ref4;
    _ref = this.collisionBoxes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      box = _ref[_i];
      if (((b.x1 <= (_ref2 = box.x1) && _ref2 <= b.x2)) && (((box.y1 <= (_ref3 = b.y1) && _ref3 <= box.y2)) || ((box.y1 <= (_ref4 = b.y2) && _ref4 <= box.y2)) || (b.y1 < box.y1 && b.y2 > box.y2))) {
        return box.x1;
      }
    }
    return null;
  };

  collisionLayer.getBlockingRightEdge = function(b) {
    var box, _i, _len, _ref, _ref2, _ref3, _ref4;
    _ref = this.collisionBoxes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      box = _ref[_i];
      if (((b.x1 <= (_ref2 = box.x2) && _ref2 <= b.x2)) && (((box.y1 <= (_ref3 = b.y1) && _ref3 <= box.y2)) || ((box.y1 <= (_ref4 = b.y2) && _ref4 <= box.y2)) || (b.y1 < box.y1 && b.y2 > box.y2))) {
        return box.x2;
      }
    }
    return null;
  };

  collisionLayer.getBlockingTopEdge = function(b) {
    var box, _i, _len, _ref, _ref2, _ref3, _ref4;
    _ref = this.collisionBoxes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      box = _ref[_i];
      if (((b.y1 <= (_ref2 = box.y1) && _ref2 <= b.y2)) && (((box.x1 <= (_ref3 = b.x1) && _ref3 <= box.x2)) || ((box.x1 <= (_ref4 = b.x2) && _ref4 <= box.x2)) || (b.x1 < box.x1 && b.x2 > box.x2))) {
        return box.y1;
      }
    }
    return null;
  };

  collisionLayer.getBlockingBottomEdge = function(b) {
    var box, _i, _len, _ref, _ref2, _ref3, _ref4;
    _ref = this.collisionBoxes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      box = _ref[_i];
      if (((b.y1 <= (_ref2 = box.y2) && _ref2 <= b.y2)) && (((box.x1 <= (_ref3 = b.x1) && _ref3 <= box.x2)) || ((box.x1 <= (_ref4 = b.x2) && _ref4 <= box.x2)) || (b.x1 < box.x1 && b.x2 > box.x2))) {
        return box.y2;
      }
    }
    return null;
  };

  collisionLayer._createDebugOverlay = function() {
    var box, c, height, map, width, _i, _len, _ref, _ref2;
    map = this.viewport.main.map;
    _ref = [map.width.pixels, map.height.pixels], width = _ref[0], height = _ref[1];
    this.$debugOverlay = $('<div id="collision-layer-debug-overlay" />').css({
      width: width,
      height: height
    });
    this.debugOverlayCanvas = Canvas.create(width, height);
    c = this.debugOverlayCanvas.ctx;
    c.strokeStyle = "#ff0000";
    _ref2 = this.collisionBoxes;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      box = _ref2[_i];
      c.strokeRect(box.x1 + 0.5, box.y1 + 0.5, box.x2 - box.x1, box.y2 - box.y1);
    }
    return this.$debugOverlay.css('background-image', "url(" + (this.debugOverlayCanvas.element.toDataURL()) + ")");
  };

  collisionLayer._loadImage = function(success) {
    var _this = this;
    this.image = document.createElement('img');
    this.image.src = this.imagePath;
    this.image.onload = function() {
      _this.isLoaded = true;
      return success();
    };
    return this.image.onerror = function() {
      throw "Image " + imagePath + " failed to load!";
    };
  };

  collisionLayer._createCollisionBoxes = function() {
    var boxIdx, boxes, canvas, imageData, lastY, openBoxes, openLine;
    canvas = Canvas.create(this.width, this.height);
    canvas.ctx.drawImage(this.image, 0, 0);
    imageData = canvas.ctx.getImageData(0, 0, this.width, this.height);
    boxes = [];
    openBoxes = [];
    openLine = null;
    boxIdx = null;
    lastY = null;
    imageData.each(function(pixel) {
      var curBox;
      if (pixel.y !== lastY) boxIdx = 0;
      if (pixel.isTransparent()) {
        if (openLine) {
          openBoxes.push(openLine);
          openLine = null;
        }
      } else {
        if (openLine) {
          openLine[1] = pixel.x;
        } else {
          if (openBoxes.length) {
            curBox = openBoxes[boxIdx];
          } else {
            curBox = {
              x1: pixel.x,
              y1: pixel.y
            };
            openBoxes.push(curBox);
          }
          curBox.x2 = pixel.x;
          curBox.y2 = pixel.y;
        }
      }
      return lastY = pixel.y;
    });
    if (box) boxes.push(box);
    return this.collisionBoxes = boxes;
  };

}).call(this);
