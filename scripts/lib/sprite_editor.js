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
  
  window.Grid = {};
  Grid.create = function(editor, width, height) {
    return Canvas.create(width, height, function(c) {
      c.ctx.strokeStyle = "#eee";
      c.ctx.beginPath();
        // Draw vertical lines
        // We start at 0.5 because this is the midpoint of the path we want to stroke
        // See: <http://diveintohtml5.org/canvas.html#pixel-madness>
        for (var x = 0.5; x < width; x += editor.cellSize) {
          c.ctx.moveTo(x, 0);
          c.ctx.lineTo(x, height);
        }
        // Draw horizontal lines
        for (var y = 0.5; y < height; y += editor.cellSize) {
          c.ctx.moveTo(0, y);
          c.ctx.lineTo(width, y);
        }
        c.ctx.stroke();
      c.ctx.closePath();
      
      var fontSize = 11;
      c.ctx.font = fontSize+"px Helvetica";
      var text = (width / editor.cellSize) + "px";
      var metrics = c.ctx.measureText(text);
      c.ctx.fillText(text, width/2-metrics.width/2, height/2+fontSize/4);
    });
  }

  window.SpriteEditor = (function() {
    var editor = {};
    
    editor.tickInterval = 30; // ms/frame
    editor.widthInCells = 16; // cells
    editor.heightInCells = 16; // cells
    editor.cellSize = 30; // pixels
    
    editor.timer = null;
    editor.width = null;
    editor.height = null;
    editor.canvas = null;
    editor.gridCanvas = null;
    editor.previewCanvas = null;
    editor.currentCell = null;
    editor.cells = [];
    editor.currentColor = {red: 172, green: 85, blue: 255}
    editor.dragging = false;
    editor.mouseDownAt = null;
    editor.pressedKeys = {};
    editor.currentTool = "pencil";
    editor.currentCellToStartFill = null;
    
    Object.extend(editor, {
      init: function() {
        var self = this;
        self._initCells();
        self._createCanvas();
        self._createGridCanvas();
        self._createRightPane();
        self._createToolbox();
        self._createBrushSizes();
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
        self._clearTiledPreviewCanvas();
        self._drawGrid();
        self._highlightCurrentCell();
        self._fillCells();
        self._updateTiledPreviewCanvas();
      },
      
      stop: function() {
        var self = this;
        clearInterval(self.timer);
        return self;
      },
      
      _initCells: function() {
        var self = this;
        for (var i=0; i<self.heightInCells; i++) {
          var row = self.cells[i] = [];
          for (var j=0; j<self.widthInCells; j++) {
            row[j] = {
              actual: {
                x: j,
                y: i
              },
              enlarged: {
                x: j*self.cellSize,
                y: i*self.cellSize
              },
              color: null
            };
          }
        }
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
      
      _createRightPane: function() {
        var self = this;
        self.rightPane = document.createElement("div");
        self.rightPane.id = "right_pane";
        document.body.appendChild(self.rightPane);
      },
      
      _createColorControls: function() {
        var self = this;
        
        var boxDiv = document.createElement("div");
        boxDiv.id = "color_box";
        boxDiv.className = "box";
        self.rightPane.appendChild(boxDiv);
        
        var h3 = document.createElement("h3");
        h3.innerHTML = "Color";
        boxDiv.appendChild(h3);
        
        var colorSampleDiv = document.createElement("div");
        colorSampleDiv.id = "color_sample";
        
        var colorControlsDiv = document.createElement("div");
        colorControlsDiv.id = "color_controls";
        boxDiv.appendChild(colorControlsDiv);
        
        var colors = [["red", "Red"], ["green", "Green"], ["blue", "Blue"]];
        _.each(colors, function(_) {
          var id = _[0], name = _[1];
          var colorDiv = document.createElement("div");
          colorControlsDiv.appendChild(colorDiv);
          
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
        
        boxDiv.appendChild(colorSampleDiv);
      },
      
      _createPreview: function() {
        var self = this;
        
        var boxDiv = document.createElement("div");
        boxDiv.id = "preview_box";
        boxDiv.className = "box";
        self.rightPane.appendChild(boxDiv);
        
        var h3 = document.createElement("h3");
        h3.innerHTML = "Preview";
        boxDiv.appendChild(h3);
        
        self.previewCanvas = Canvas.create(self.widthInCells, self.heightInCells);
        self.previewCanvas.element.id = "preview_canvas";
        boxDiv.appendChild(self.previewCanvas.element);
        
        self.tiledPreviewCanvas = Canvas.create(self.widthInCells * 9, self.heightInCells * 9);
        self.tiledPreviewCanvas.element.id = "tiled_preview_canvas";
        boxDiv.appendChild(self.tiledPreviewCanvas.element);
      },
      
      _createToolbox: function() {
        var self = this;
        
        var boxDiv = document.createElement("div");
        boxDiv.id = "tool_box";
        boxDiv.className = "box";
        self.rightPane.appendChild(boxDiv);
        
        var h3 = document.createElement("h3");
        h3.innerHTML = "Toolbox";
        boxDiv.appendChild(h3);
        
        var ul = document.createElement("ul");
        var imgs = [];
        _.each(["pencil", "bucket"], function(tool) {
          var li = document.createElement("li");
          
          var img = document.createElement("img");
          img.className = "tool";
          img.width = 24;
          img.height = 24;
          img.src = "images/sprite_editor/"+tool+".png";
          imgs.push(img);
          li.appendChild(img);
          ul.appendChild(li);
          
          bean.add(img, 'click', function() {
            self.currentTool = tool;
            _.each(imgs, function(img) { img.className = img.className.replace("selected", "") })
            img.className += " selected";
          })
          
          if (self.currentTool == tool) bean.fire(img, 'click');
        })
        boxDiv.appendChild(ul);
      },
      
      _createBrushSizes: function() {
        var self = this;
        
        var boxDiv = document.createElement("div");
        boxDiv.id = "sizes_box";
        boxDiv.className = "box";
        self.rightPane.appendChild(boxDiv);
        
        var h3 = document.createElement("h3");
        h3.innerHTML = "Sizes";
        boxDiv.appendChild(h3);
        
        _.each([1, 2, 3, 4], function(brushSize) {
          grid = Grid.create(self, self.cellSize*brushSize, self.cellSize*brushSize);
          boxDiv.appendChild(grid.element);
          bean.add(grid.element, 'click', function() {
            self.currentBrushSize = brushSize;
          })
        })
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
            
            // If dragging isn't set yet, set it until the mouse is lifted off
            if (self.mouseDownAt) {
              if (!self.dragging) {
                self.dragging = (self._distance(self.mouseDownAt, mouse) > 3);
              }
            } else {
              self.dragging = false;
            }
            
            if (self.dragging) {
              if (event.rightClick || self.pressedKeys[16]) {
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
            if (!self.dragging) {
              switch (self.currentTool) {
                case "pencil":
                  if (event.rightClick || self.pressedKeys[16]) {
                    self._setCurrentCellToUnfilled();
                  } else {
                    self._setCurrentCellToFilled();
                  }
                  break;
                case "bucket":
                  self._setFilledCellsLikeCurrentCell();
                  break;
              }
            }
            self.mouseDownAt = null;
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
        bean.add(document, {
          keydown: function(event) {
            self.pressedKeys[event.keyCode] = true;
          },
          keyup: function(event) {
            self.pressedKeys[event.keyCode] = false;
          }
        })
      },
      
      _setCurrentCell: function(mouse) {
        var self = this;
        var i = Math.floor((mouse.y - self.canvas.element.offsetTop)  / self.cellSize);
        var j = Math.floor((mouse.x - self.canvas.element.offsetLeft) / self.cellSize);
        self.currentCell = self.cells[i][j];
      },
      
      _setCurrentCellToFilled: function() {
        var self = this;
        if (self.currentCell) {
          // Clone so when changing the current color we don't change all cells
          // filled with that color
          self.currentCell.color = Object.extend({}, self.currentColor);
        }
      },
      
      _setCurrentCellToUnfilled: function() {
        var self = this;
        if (self.currentCell) {
          self.currentCell.color = null;
        }
      },
      
      _setFilledCellsLikeCurrentCell: function() {
        var self = this;
        // Copy this as the color of the current cell will change during this loop
        var currentCellColor = Object.extend({}, self.currentCell.color);
        // Look for all cells with the color (or non-color) of the current cell
        // and mark them as filled with the current color
        _.each(self.cells, function(row, i) {
          _.each(row, function(cell, j) {
            if (self._colorsEqual(cell.color, currentCellColor)) {
              cell.color = Object.extend({}, self.currentColor);
            }
          })
        })
      },
      
      _clearCanvas: function() {
        var self = this;
        var c = self.canvas;
        c.ctx.clearRect(0, 0, c.element.width, c.element.height);
      },
      
      _clearPreviewCanvas: function() {
        var self = this;
        var pc = self.previewCanvas;
        // clearRect() won't clear image data set using createImageData(),
        // so this is another way to clear the canvas that works
        pc.element.width = pc.element.width;
        pc.imageData = pc.ctx.createImageData(self.widthInCells, self.heightInCells);
        self._extendImageData(pc.imageData);
      },
      
      _clearTiledPreviewCanvas: function() {
        var self = this;
        var ptc = self.tiledPreviewCanvas;
        ptc.ctx.clearRect(0, 0, ptc.element.width, ptc.element.height);
      },
      
      _drawGrid: function() {
        var self = this;
        self.canvas.ctx.drawImage(self.gridCanvas.element, 0, 0);
      },
      
      _highlightCurrentCell: function() {
        var self = this;
        var ctx = self.canvas.ctx;
        if (self.currentCell && !(self.dragging || self.pressedKeys[16])) {
          var cx = self.currentCell.enlarged.x;
          var cy = self.currentCell.enlarged.y;
          ctx.save();
            ctx.fillStyle = 'rgba('+self._rgb(self.currentColor)+',0.5)';
            ctx.fillRect(cx+1, cy+1, self.cellSize-1, self.cellSize-1);
          ctx.restore();
        }
      },
      
      _fillCells: function() {
        var self = this;
        var c = self.canvas;
        var pc = self.previewCanvas;
        c.ctx.save();
          _.each(self.cells, function(row, i) {
            _.each(row, function(cell, j) {
              if (cell.color) {
                c.ctx.fillStyle = 'rgb('+self._rgb(cell.color)+')';
                c.ctx.fillRect(cell.enlarged.x+1, cell.enlarged.y+1, self.cellSize-1, self.cellSize-1);
                pc.imageData.fillPixel(cell.actual.x, cell.actual.y, cell.color.red, cell.color.green, cell.color.blue, 255);
              }
            })
          })
        c.ctx.restore();
        pc.ctx.putImageData(pc.imageData, 0, 0);
      },
      
      _updateTiledPreviewCanvas: function() {
        var self = this;
        var tpc = self.tiledPreviewCanvas;
        var pattern = tpc.ctx.createPattern(self.previewCanvas.element, 'repeat');
        tpc.ctx.save();
          tpc.ctx.fillStyle = pattern;
          tpc.ctx.fillRect(0, 0, tpc.element.width, tpc.element.height);
        tpc.ctx.restore();
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
      
      _colorsEqual: function(c1, c2) {
        return c1 && c2 && c1.red == c2.red && c1.green == c2.green && c1.blue == c2.blue;
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