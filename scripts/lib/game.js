(function() {
  window.Canvas = {};
  Canvas.tileSize = 16;
  Canvas.tickInterval = 150;
  Canvas.numTilesWidth = 48;
  Canvas.numTilesHeight = 32;
  Canvas.width = Canvas.tileSize * Canvas.numTilesWidth;
  Canvas.height = Canvas.tileSize * Canvas.numTilesHeight;
  Canvas.imagePath = "images";
  Canvas.imageNames = ["grass"];
  Object.extend(Canvas, {
    init: function() {
      var canvas, self;
      self = this;
      canvas = self.canvas = document.createElement("canvas");
      canvas.width = self.width;
      canvas.height = self.height;
      document.body.appendChild(canvas);
      self.canvas = canvas;
      self.ctx = canvas.getContext("2d");
      self.delayDrawing = true;
      return self._preloadImages();
    },
    run: function() {
      var self;
      self = this;
      return setTimeout((function() {
        return self._redraw();
      }), self.tickInterval);
    },
    _preloadImages: function() {
      var i, images, self, _fn, _ref;
      self = this;
      images = [];
      _fn = function(i) {
        var image, name;
        name = self.imageNames[i];
        image = new Image(self.tileSize, self.tileSize);
        image.src = self.imagePath + "/" + name + ".gif";
        image.onload = function() {
          if (i === self.imageNames.length - 1) {
            return self.delayDrawing = false;
          }
        };
        return images.push(image);
      };
      for (i = 0, _ref = self.imageNames.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        _fn(i);
      }
      return self.images = images;
    },
    _redraw: function() {
      var i, j, self, _ref, _results;
      self = this;
      if (self.delayDrawing) {
        return;
      }
      _results = [];
      for (i = 0, _ref = self.numTilesWidth; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        _results.push((function() {
          var _ref, _results;
          _results = [];
          for (j = 0, _ref = self.numTilesHeight; (0 <= _ref ? j < _ref : j > _ref); (0 <= _ref ? j += 1 : j -= 1)) {
            _results.push(self.ctx.drawImage(self.images[0], i * self.tileSize, j * self.tileSize));
          }
          return _results;
        })());
      }
      return _results;
    }
  });
  $(function() {
    Canvas.init();
    return Canvas.run();
  });
}).call(this);
