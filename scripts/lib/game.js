(function(window, document, $, undefined) {
  
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
      var self = this;

      var canvas = self.canvas = document.createElement("canvas");
      canvas.width = self.width;
      canvas.height = self.height;
      document.body.appendChild(canvas);

      self.canvas = canvas;
      self.ctx    = canvas.getContext("2d");

      self.delayDrawing = true;
      self._preloadImages();
    },

    run: function() {
      var self = this;
      setInterval(function() { self._redraw() }, self.tickInterval);
    },
    
    _preloadImages: function() {
      var self = this;
      var images = [];
      for (var i=0; i<self.imageNames.length; i++) {
        (function(i) {
          var name = self.imageNames[i];
          var image = new Image(self.tileSize, self.tileSize);
          image.src = self.imagePath + "/" + name + ".gif";
          image.onload = function() {
            if (i == self.imageNames.length-1) self.delayDrawing = false;
          }
          images.push(image);
        })(i)
      }
          
      self.images = images;
    },

    _redraw: function() {
      var self = this;
      if (self.delayDrawing) return;
      for (var i=0; i<self.numTilesWidth; i++) {
        for (var j=0; j<self.numTilesHeight; j++) {
          self.ctx.drawImage(self.images[0], i*self.tileSize, j*self.tileSize);
        }
      }
    }
  })

  $(function() {
    Canvas.init();
    Canvas.run();
  })
  
})(window, window.document, window.$);