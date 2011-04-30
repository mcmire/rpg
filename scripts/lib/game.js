(function(window, document, $, undefined) {
  
  window.Canvas = {};

  Canvas.tileSize = 16;
  Canvas.tickInterval = 150;
  Canvas.numTilesWidth = 48;
  Canvas.numTilesHeight = 32;
  Canvas.width = Canvas.tileSize * Canvas.numTilesWidth;
  Canvas.height = Canvas.tileSize * Canvas.numTilesHeight;

  Canvas.imagePath = "images";
  Canvas.imageNames = ["grass", "player"];
  
  Canvas.images = {};

  Object.extend(Canvas, {
    init: function() {
      var self = this;

      var canvas = self.canvas = document.createElement("canvas");
      canvas.width = self.width;
      canvas.height = self.height;
      document.body.appendChild(canvas);

      self.canvas = canvas;
      self.ctx    = canvas.getContext("2d");

      self.ready = false;
      self._preloadImages();
    },

    run: function() {
      var self = this;
      setInterval(function() { self._redraw() }, self.tickInterval);
    },
    
    _preloadImages: function() {
      var self = this;
      var images = {};
      for (var i=0; i<self.imageNames.length; i++) {
        (function(i) {
          var name = self.imageNames[i];
          var image = new Image(self.tileSize, self.tileSize);
          image.src = self.imagePath + "/" + name + ".gif";
          image.onload = function() {
            if (i == self.imageNames.length-1) self.ready = true;
          }
          images[name] = image;
        })(i)
      }
          
      self.images = images;
    },

    _redraw: function() {
      var self = this;
      if (!self.ready) return;
      
      // Draw background
      for (var i=0; i<self.numTilesWidth; i++) {
        for (var j=0; j<self.numTilesHeight; j++) {
          self.ctx.drawImage(self.images["grass"], i*self.tileSize, j*self.tileSize);
        }
      }
      
      // Draw player
      self.ctx.drawImage(self.images["player"], (self.numTilesWidth/2)*self.tileSize, (self.numTilesHeight/2)*self.tileSize);
    }
  })

  $(function() {
    Canvas.init();
    Canvas.run();
  })
  
})(window, window.document, window.$);