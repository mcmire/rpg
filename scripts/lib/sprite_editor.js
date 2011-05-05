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
      red: 172,
      green: 85,
      blue: 255
    }
    editor.dragging = false;
    editor.mouseDownAt = null;
    
    Object.extend(editor, {
      init: function() {
        var self = this;
        self._createCanvas();
        self._createGridCanvas();
        self._createColorControls();
        self._createPreview();
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
        self._clearCanvas();
        self._clearPreviewCanvas();
        self._drawGrid();
        self._highlightCurrentCell();
        self._drawFilledCells();
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
        self.canvas.element.id = "enlarged_canvas";
        document.body.appendChild(self.canvas.element);
      },
      
      _createGridCanvas: function() {
        // TODO: Use canvas.toDataURL() to save as a PNG and use as background
        // image for the canvas which we draw once at init
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
        
        var h3 = document.createElement("h3");
        h3.innerHTML = "Color";
        wrapperDiv.appendChild(h3);
        
        var colorSampleDiv = document.createElement("div");
        colorSampleDiv.id = "color_sample";
        
        var colors = [["red", "Red"], ["green", "Green"], ["blue", "Blue"]];
        _.each(colors, function(_) {
          var id = _[0], name = _[1];
          var colorDiv = document.createElement("div");
          wrapperDiv.appendChild(colorDiv);
          
          colorDiv.appendChild(document.createTextNode(name + " "));
          
          var colorSlider = document.createElement("input");
          colorSlider.type = "range";
          colorSlider.min = 0;
          colorSlider.max = 255;
          colorSlider.value = self.currentColor[id];
          colorDiv.appendChild(colorSlider);
          
          var colorValueSpan = document.createElement("span");
          colorDiv.appendChild(colorValueSpan);
          
          bean.add(colorSlider, 'change', function() {
            colorValueSpan.innerHTML = " " + colorSlider.value;
            self.currentColor[id] = parseInt(colorSlider.value);
            colorSampleDiv.style.backgroundColor = 'rgb('+self._rgb(self.currentColor)+')';
          })
          bean.fire(colorSlider, 'change');
        })
        
        wrapperDiv.appendChild(colorSampleDiv);
      },
      
      _createPreview: function() {
        var self = this;
        
        var wrapperDiv = document.createElement("div");
        wrapperDiv.id = "preview";
        document.body.appendChild(wrapperDiv);
        
        var h3 = document.createElement("h3");
        h3.innerHTML = "Preview";
        wrapperDiv.appendChild(h3);
        
        var canvas = self.previewCanvas = Canvas.create(self.widthInCells, self.heightInCells);
        wrapperDiv.appendChild(canvas.element);
      },
      
      _addEvents: function() {
        var self = this;
        bean.add(self.canvas.element, {
          mouseover: function(event) {
            self.start();
          },
          mousemove: function(event) {
            var mouse = {x: event.pageX, y: event.pageY};
            
            self._setCurrentCell(mouse);
            
            if (self.mouseDownAt) {
              // If dragging isn't set yet, set it until the mouse is lifted off
              if (!self.dragging) {
                self.dragging = (self._distance(self.mouseDownAt, mouse) > 3);
              }
            } else {
              self.dragging = false;
            }
            
            if (self.dragging) {
              if (event.rightClick) {  // thanks, bean!
                self._setCurrentCellToUnfilled();
              } else {
                self._setCurrentCellToFilled();
              }
            }
          },
          mousedown: function(event) {
            self.mouseDownAt = {x: event.pageX, y: event.pageY};
            event.preventDefault();
          },
          mouseup: function(event) {
            self.mouseDownAt = null;
            if (event.rightClick) {  // thanks, bean!
              self._setCurrentCellToUnfilled();
            } else {
              self._setCurrentCellToFilled();
            }
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
      
      _setCurrentCell: function(mouse) {
        var self = this;
        var currentCell = {enlarged: {}, actual: {}};
        currentCell.actual.x = Math.floor((mouse.x - self.canvas.element.offsetLeft) / self.cellSize);
        currentCell.actual.y = Math.floor((mouse.y - self.canvas.element.offsetTop)  / self.cellSize);
        // Round the mouse position to the position of the nearest cell
        currentCell.enlarged.x = currentCell.actual.x * self.cellSize;
        currentCell.enlarged.y = currentCell.actual.y * self.cellSize;
        self.currentCell = currentCell;
      },
      
      _setCurrentCellToFilled: function() {
        var self = this;
        if (self.currentCell) {
          var key = [self.currentCell.enlarged.x, self.currentCell.enlarged.y].join(",")
          var data = {};
          // Clone so when changing the current color we don't change all cells
          // filled with that color
          data.color = Object.extend({}, self.currentColor);
          data.color.rgb = self._rgb(self.currentColor);
          data.enlarged = Object.extend({}, self.currentCell.enlarged);
          data.actual = Object.extend({}, self.currentCell.actual);
          self.filledCells[key] = data;
        }
      },
      
      _setCurrentCellToUnfilled: function() {
        var self = this;
        if (self.currentCell) {
          var key = [self.currentCell.enlarged.x, self.currentCell.enlarged.y].join(",")
          delete self.filledCells[key];
        }
      },
      
      _clearCanvas: function() {
        var self = this;
        var c = self.canvas;
        c.ctx.clearRect(0, 0, c.element.width, c.element.height);
      },
      
      _clearPreviewCanvas: function() {
        var self = this;
        var pc = self.previewCanvas;
        //self.previewCanvas.ctx.clearRect(0, 0, self.previewCanvas.element.width, self.previewCanvas.element.height);
        pc.element.width = pc.element.width;
        pc.imageData = pc.ctx.createImageData(self.widthInCells, self.heightInCells);
        self._extendImageData(pc.imageData);
      },
      
      _drawGrid: function() {
        var self = this;
        self.canvas.ctx.drawImage(self.gridCanvas.element, 0, 0);
      },
      
      _highlightCurrentCell: function() {
        var self = this;
        var ctx = self.canvas.ctx;
        if (self.currentCell && !self.dragging) {
          var cx = self.currentCell.enlarged.x;// + 0.5;
          var cy = self.currentCell.enlarged.y;// + 0.5;
          ctx.save();
            ctx.fillStyle = 'rgba('+self._rgb(self.currentColor)+',0.5)';
            ctx.fillRect(cx+1, cy+1, self.cellSize-1, self.cellSize-1);
          ctx.restore();
        }
      },
      
      _drawFilledCells: function() {
        var self = this;
        var c = self.canvas;
        var pc = self.previewCanvas;
        c.ctx.save();
          _.each(self.filledCells, function(data, _) {
            c.ctx.fillStyle = 'rgb('+data.color.rgb+')';
            c.ctx.fillRect(data.enlarged.x+1, data.enlarged.y+1, self.cellSize-1, self.cellSize-1);
            pc.imageData.fillPixel(data.actual.x, data.actual.y, data.color.red, data.color.green, data.color.blue, 255);
          })
        c.ctx.restore();
        pc.ctx.putImageData(pc.imageData, 0, 0);
      },
      
      _extendImageData: function(imageData) {
        // http://beej.us/blog/2010/02/html5s-canvas-part-ii-pixel-manipulation/
        imageData.fillPixel = function(x, y, r, g, b, a) {
          var index = (x + y * this.width) * 4;
          this.data[index+0] = r;
          this.data[index+1] = g;
          this.data[index+2] = b;
          this.data[index+3] = a;
        }
      },
      
      _rgb: function(c) {
        return [c.red, c.green, c.blue].join(",");
      },
      
      _distance: function(v1, v2) {
        return Math.sqrt(Math.pow((v2.y - v1.y), 2) + Math.pow((v2.x - v1.x), 2));
      }
    })
    
    return editor;
    
  })();
  
  $(function(){
    SpriteEditor.init();
  })

})(window, window.document, window.$, window._);