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
    
    editor.tickInterval = 30; // ms/frame
    editor.widthInCells = 16; // cells
    editor.heightInCells = 16; // cells
    editor.cellSize = 30; // pixels
    
    editor.canvas = null;
    editor.width = null;
    editor.height = null;
    editor.timer = null;
    editor.gridCanvas = null;
    editor.currentCell = null;
    editor.filledCells = {};
    editor.currentColor = {
      red: 76,
      green: 107,
      blue: 242
    }
    editor.dragging = false;
    
    Object.extend(editor, {
      init: function() {
        var self = this;
        self._createCanvas();
        self._createGridCanvas();
        self._createColorControls();
        self._addEvents();
        self.redraw();
        return self;
      },
      
      start: function() {
        var self = this;
        self.timer = setInterval(function() { self.redraw() }, self.tickInterval);
        return self;
      },
      
      redraw: function() {
        var self = this;
        self.canvas.ctx.clearRect(0, 0, self.width, self.height);
        self._drawGridCanvas();
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
          c.ctx.beginPath();
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
          c.ctx.closePath();
        });
      },
      
      _createColorControls: function() {
        var self = this;
        
        var wrapperDiv = document.createElement("div");
        wrapperDiv.id = "color_controls";
        document.body.appendChild(wrapperDiv);
        
        var colorSampleDiv = document.createElement("div");
        colorSampleDiv.id = "color_sample";
        
        var colors = [["red", "Red"], ["green", "Green"], ["blue", "Blue"]];
        _.each(colors, function(_) {
          var id = _[0], name = _[1];
          var colorDiv = document.createElement("div");
          wrapperDiv.appendChild(colorDiv);
          
          var colorSlider = document.createElement("input");
          colorSlider.type = "range";
          colorSlider.min = 0;
          colorSlider.max = 255;
          colorSlider.value = self.currentColor[id];
          colorDiv.appendChild(colorSlider);
          
          colorDiv.appendChild(document.createTextNode(name + ": "));
          
          var colorValueSpan = document.createElement("span");
          colorDiv.appendChild(colorValueSpan);
          
          bean.add(colorSlider, 'change', function() {
            self.currentColor[id] = colorValueSpan.innerHTML = colorSlider.value;
            colorSampleDiv.style.backgroundColor = 'rgb('+self._colorAsString(self.currentColor)+')';
          })
          bean.fire(colorSlider, 'change');
        })
        
        wrapperDiv.appendChild(colorSampleDiv);
      },
      
      _addEvents: function() {
        var self = this;
        bean.add(self.canvas.element, {
          mouseover: function(event) {
            self.start();
          },
          mousemove: function(event) {
            self._setCurrentCell(event.pageX, event.pageY);
            if (self.dragging) {
              if (event.rightClick) {  // thanks, bean
                self._setCurrentCellToUnfilled();
              } else {
                self._setCurrentCellToFilled();
              }
            }
          },
          mousedown: function(event) {
            self.dragging = true;
            event.preventDefault();
          },
          mouseup: function(event) {
            self.dragging = false;
            event.preventDefault();
          },
          mouseout: function(event) {
            self.currentCell = null;
            self.stop();
            self.redraw();
          },
          click: function(event) {
            event.preventDefault();
          },
          contextmenu: function(event) {
            event.preventDefault();
          }
        })
      },
      
      _setCurrentCell: function(mx, my) {
        var self = this;
        // Round the mouse position to the position of the nearest cell
        var cx = Math.floor((mx - self.canvas.element.offsetLeft) / self.cellSize) * self.cellSize;
        var cy = Math.floor((my - self.canvas.element.offsetTop) / self.cellSize) * self.cellSize;
        self.currentCell = {x: cx, y: cy};
      },
      
      _setCurrentCellToFilled: function() {
        var self = this;
        if (self.currentCell) {
          var key = [self.currentCell.x, self.currentCell.y].join(",")
          // Clone so when changing the current color we don't change all cells
          // filled with the previous color
          self.filledCells[key] = Object.extend({}, self.currentColor);
        }
      },
      
      _setCurrentCellToUnfilled: function() {
        var self = this;
        if (self.currentCell) {
          var key = [self.currentCell.x, self.currentCell.y].join(",")
          delete self.filledCells[key];
        }
      },
      
      _drawGridCanvas: function() {
        var self = this;
        var ctx = self.canvas.ctx;
        
        // Draw the grid
        ctx.drawImage(self.gridCanvas.element, 0, 0);
        
        // Highlight current cell
        if (self.currentCell) {
          var cx = self.currentCell.x;// + 0.5;
          var cy = self.currentCell.y;// + 0.5;
          ctx.save();
            ctx.fillStyle = 'rgba('+self._colorAsString(self.currentColor)+',0.5)';
            ctx.fillRect(cx+1, cy+1, self.cellSize-1, self.cellSize-1);
          ctx.restore();
        }
        
        // Fill cells
        _.each(self.filledCells, function(color, coords) {
          var _ = coords.split(","), x = parseInt(_[0]), y = parseInt(_[1]);
          ctx.save();
            ctx.fillStyle = 'rgb('+self._colorAsString(color)+')';
            ctx.fillRect(x+1, y+1, self.cellSize-1, self.cellSize-1);
          ctx.restore();
        }) 
      },
      
      _colorAsString: function(c) {
        return [c.red, c.blue, c.green].join(",");
      }
    })
    
    return editor;
    
  })();
  
  $(function(){
    SpriteEditor.init();
  })

})(window, window.document, window.$, window._);