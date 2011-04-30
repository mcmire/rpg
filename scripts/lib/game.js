(function(window, document, $, undefined) {
  
  // Keyboard
  
  window.Keyboard = {};
  
  // Canvas
  
  window.Canvas = (function() {
    var canvas;
    var ctx;
    var images = {};
    var ready = false;
    
    return {
      tickInterval: 150,
      tileSize: 32,
      numTilesWidth: 24,
      numTilesHeight: 16,

      imagePath: "images",
      
      imageNames: ["grass", "player"],
      
      init: function() {
        var self = this;

        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        canvas.width = self.tileSize * self.numTilesWidth;
        canvas.height = self.tileSize * self.numTilesHeight;
        document.body.appendChild(canvas);

        ready = false;
        self._preloadImages();
      },

      run: function() {
        var self = this;
        setInterval(function() { self._redraw() }, self.tickInterval);
      },

      _preloadImages: function() {
        var self = this;
        for (var i=0; i<self.imageNames.length; i++) {
          (function(i) {
            var name = self.imageNames[i];
            var image = new Image(self.tileSize, self.tileSize);
            image.src = self.imagePath + "/" + name + ".gif";
            image.onload = function() {
              if (i == self.imageNames.length-1) ready = true;
            }
            images[name] = image;
          })(i)
        }
      },

      _redraw: function() {
        var self = this;
        if (!ready) return;

        // Draw background
        for (var i=0; i<self.numTilesWidth; i++) {
          for (var j=0; j<self.numTilesHeight; j++) {
            ctx.drawImage(images["grass"], i*self.tileSize, j*self.tileSize);
          }
        }

        // Draw player
        ctx.drawImage(images["player"], (self.numTilesWidth/2)*self.tileSize, (self.numTilesHeight/2)*self.tileSize);
      }
    }
  })();

  $(function() {
    Canvas.init();
    Canvas.run();
  })
  
})(window, window.document, window.$);