(function(window, document, $, _, undefined) {

  window.Canvas = {};
  Canvas.create = function(width, height, callback) {
    var c = {};
    c.element = document.createElement("canvas");
    c.ctx = c.element.getContext("2d");
    c.element.width = width;
    c.element.height = height;
    if (callback) callback(c);
    return c;
  }

  window.SpriteEditor = (function() {
    var editor = {};
    
    editor.canvas = null;
    editor.timer = null;
    editor.width = null;
    editor.height = null;
    
    editor.tickInterval = 30; // ms/frame
    editor.widthInCells = 16; // cells
    editor.heightInCells = 16; // cells
    editor.cellSize = 30; // pixels
    
    Object.extend(editor, {
      init: function() {
        var self = this;
        self._createCanvas();
        self._createGridCanvas();
        self._addEvents();
        return self;
      },
      
      start: function() {
        var self = this;
        self.timer = setInterval(function() { self._redraw() }, self.tickInterval);
        return self;
      },
      
      stop: function() {
        var self = this;
        clearInterval(self.timer);
        return self;
      },
      
      _createCanvas: function() {
        var self = this;
        self.width = self.widthInCells * self.cellSize;
        self.height = self.heightInCells * self.cellSize;
        self.canvas = Canvas.create(self.width, self.height);
        document.body.appendChild(self.canvas.element);
      },
      
      _createGridCanvas: function() {
        var self = this;
        self.gridCanvas = Canvas.create(self.width, self.height, function(c) {
          c.ctx.strokeStyle = "#eee";
          // Draw vertical lines
          // We start at 0.5 because this is the midpoint of the path we want to stroke
          // See: <http://diveintohtml5.org/canvas.html#pixel-madness>
          for (var x = 0.5; x < self.width; x += self.cellSize) {
            c.ctx.moveTo(x, 0);
            c.ctx.lineTo(x, self.height);
          }
          // Draw horizontal lines
          for (var y = 0.5; y < self.height; y += self.cellSize) {
            c.ctx.moveTo(0, y);
            c.ctx.lineTo(self.width, y);
          }
          c.ctx.stroke();
        });
      },
      
      _addEvents: function() {
        var self = this;
        bean.add(self.canvas.element, 'mousemove', function(event) {
          self._setActiveCell(event.pageX, event.pageY);
        })
        bean.add(self.canvas.element, 'mouseout', function(event) {
          self.activeCell = null;
        })
      },
      
      _redraw: function() {
        var self = this;
        //self.canvas.ctx.clearRect(self.width, self.height);
        self.canvas.element.width = self.canvas.element.width; // clear the canvas
        self._drawGridCanvas();
      },
      
      _setActiveCell: function(mx, my) {
        var self = this;
        // Round the mouse position to the position of the nearest cell
        var cx = Math.floor((mx - self.canvas.element.offsetLeft) / self.cellSize) * self.cellSize;
        var cy = Math.floor((my - self.canvas.element.offsetTop) / self.cellSize) * self.cellSize;
        self.activeCell = {x: cx, y: cy};
      },
      
      _drawGridCanvas: function() {
        var self = this;
        var ctx = self.canvas.ctx;
        
        // Draw the grid
        ctx.drawImage(self.gridCanvas.element, 0, 0);
        
        // Highlight active cell
        if (self.activeCell) {
          var cx = self.activeCell.x + 0.5;
          var cy = self.activeCell.y + 0.5;
          ctx.save();
            ctx.strokeStyle = "#666";
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + self.cellSize, cy);
            ctx.lineTo(cx + self.cellSize, cy + self.cellSize);
            ctx.lineTo(cx, cy + self.cellSize);
            ctx.lineTo(cx, cy);
            ctx.stroke();
          ctx.restore();
        }
      }
    })
    
    return editor;
    
  })();
  
  $(function(){
    SpriteEditor.init().start();
  })

})(window, window.document, window.$, window._);