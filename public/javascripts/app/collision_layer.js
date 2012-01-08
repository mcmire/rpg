(function() {
  var Bounds, Canvas, CollisionBox, CollisionBoxes, EventHelpers, collisionLayer, game;

  game = window.game;

  Canvas = game.Canvas, EventHelpers = game.EventHelpers, Bounds = game.Bounds;

  CollisionBoxes = (function() {

    function CollisionBoxes(boxes, box) {
      this.boxes = boxes;
      this.box = box;
    }

    CollisionBoxes.prototype.each = function(fn) {
      var box, ret, _i, _j, _len, _len2, _ref, _ref2, _results, _results2;
      if (this.box) {
        _ref = this.boxes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          box = _ref[_i];
          if (box !== this.box) {
            ret = fn(box);
            if (ret === false) {
              break;
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else {
        _ref2 = this.boxes;
        _results2 = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          box = _ref2[_j];
          ret = fn(box);
          if (ret === false) {
            break;
          } else {
            _results2.push(void 0);
          }
        }
        return _results2;
      }
    };

    CollisionBoxes.prototype.get = function(index) {
      return this.boxes[index];
    };

    CollisionBoxes.prototype.push = function(box) {
      return this.boxes.push(box);
    };

    CollisionBoxes.prototype.without = function(box) {
      return new CollisionBoxes(this.boxes, box);
    };

    CollisionBoxes.prototype.intersectsWith = function(bounds) {
      var ret;
      ret = false;
      this.each(function(box) {
        if (box.intersectsWith(bounds)) {
          ret = true;
          return false;
        }
      });
      return ret;
    };

    CollisionBoxes.prototype.getOuterLeftEdgeBlocking = function(bounds) {
      var ret;
      ret = null;
      this.each(function(box) {
        if (ret = box.getOuterLeftEdgeBlocking(bounds)) return false;
      });
      return ret;
    };

    CollisionBoxes.prototype.getOuterRightEdgeBlocking = function(bounds) {
      var ret;
      ret = null;
      this.each(function(box) {
        if (ret = box.getOuterRightEdgeBlocking(bounds)) return false;
      });
      return ret;
    };

    CollisionBoxes.prototype.getOuterTopEdgeBlocking = function(bounds) {
      var ret;
      ret = null;
      this.each(function(box) {
        if (ret = box.getOuterTopEdgeBlocking(bounds)) return false;
      });
      return ret;
    };

    CollisionBoxes.prototype.getOuterBottomEdgeBlocking = function(bounds) {
      var ret;
      ret = null;
      this.each(function(box) {
        if (ret = box.getOuterBottomEdgeBlocking(bounds)) return false;
      });
      return ret;
    };

    return CollisionBoxes;

  })();

  CollisionBox = (function() {

    function CollisionBox(bounds) {
      this.bounds = bounds;
    }

    CollisionBox.prototype.intersectsWith = function(bounds) {
      return this.bounds.intersectsWith(bounds);
    };

    CollisionBox.prototype.getOuterLeftEdgeBlocking = function(bounds) {
      return this.bounds.getOuterLeftEdgeBlocking(bounds);
    };

    CollisionBox.prototype.getOuterRightEdgeBlocking = function(bounds) {
      return this.bounds.getOuterRightEdgeBlocking(bounds);
    };

    CollisionBox.prototype.getOuterTopEdgeBlocking = function(bounds) {
      return this.bounds.getOuterTopEdgeBlocking(bounds);
    };

    CollisionBox.prototype.getOuterBottomEdgeBlocking = function(bounds) {
      return this.bounds.getOuterBottomEdgeBlocking(bounds);
    };

    return CollisionBox;

  })();

  collisionLayer = game.util.module("game.collisionLayer", [EventHelpers]);

  collisionLayer.init = function(main) {
    var _this = this;
    this.main = main;
    if (!this.isInit) {
      this.isLoaded = false;
      this.viewport = this.main.viewport;
      this.width = this.viewport.width.pixels;
      this.height = this.viewport.height.pixels;
      this.collisionBoxes = new CollisionBoxes([]);
      this.imagePath = "" + this.main.imagesPath + "/mask.gif";
      this._loadImage(function() {});
      this.add(Bounds.fromCoords(96, 96, 352, 112));
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

  collisionLayer.add = function(boundsOrMob) {
    var box;
    if (boundsOrMob.box != null) {
      box = boundsOrMob.box;
    } else {
      box = new CollisionBox(boundsOrMob);
    }
    return this.collisionBoxes.push(box);
  };

  collisionLayer.draw = function() {
    var bom, positionStr;
    bom = this.viewport.frame.boundsOnMap;
    positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ");
    return this.$debugOverlay.css('background-position', positionStr);
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

  game.CollisionBoxes = CollisionBoxes;

  game.CollisionBox = CollisionBox;

  game.collisionLayer = collisionLayer;

}).call(this);
