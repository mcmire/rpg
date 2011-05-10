(function(window, document, $, _, undefined) {

  var Canvas = {};
  Canvas.create = function(width, height, callback) {
    var c = {};
    c.element = document.createElement("canvas");
    c.ctx = c.element.getContext("2d");
    c.element.width = width;
    c.element.height = height;
    if (callback) callback(c);
    return c;
  }
  
  var Grid = {};
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
      // I don't know why it's /4 here, but it is...
      c.ctx.fillText(text, width/2-metrics.width/2, height/2+fontSize/4);
    });
  }
  
  var Cell = function() {
    Cell.prototype.init.apply(this, arguments);
  }
  Object.extend(Cell.prototype, {
    init: function(editor, x, y) {
      var self = this;
      self.editor = editor;
      self.j = x;
      self.i = y;
      self.actual = {x: x, y: y};
      self.enlarged = {x: x*editor.cellSize, y: y*editor.cellSize};
    },
    key: function() {
      var self = this;
      return [self.actual.x, self.actual.y].join(",")
    },
    clone: function() {
      var self = this;
      var cell = new Cell(self.editor, self.actual.x, self.actual.y);
      if (self.color) cell.color = self.color.clone();
      return cell;
    }
  })
  
  var CellHistory = {
    fixedSize: 100, // # of actions
    init: function(editor) {
      var self = this;
      self.editor = editor;
      self.events = [];
      self.currentEvent = { // Set
        hash: null,
        array: null
      };
      return self;
    },
    open: function() {
      var self = this;
      // Limit history to a fixed size
      if (self.events.length == self.fixedSize) self.events.shift();
      self.currentEvent.array = [];
      self.currentEvent.hash = {};
    },
    close: function() {
      var self = this;
      if (self.currentEvent.array.length > 0) {
        self.events.push(self.currentEvent.array);
      }
      self.currentEvent.array = null;
      self.currentEvent.hash = null;
    },
    add: function(cell) {
      var self = this;
      cell = cell.clone();
      if (!(cell.key() in self.currentEvent.hash)) {
        self.currentEvent.hash[cell.key()] = cell;
        self.currentEvent.array.push(cell);
      }
    },
    undo: function() {
      var self = this;
      var cells = self.events.pop();
      _.each(cells, function(cell) {
        self.editor.cells[cell.i][cell.j] = cell;
      })
    }
  };

  window.SpriteEditor = (function() {
    var editor = {};
    
    editor.timer = null;
    editor.width = null;
    editor.height = null;
    editor.canvas = null;
    editor.gridCanvas = null;
    editor.previewCanvas = null;
    editor.currentCell = null;
    editor.cells = [];
    editor.currentColor = Color.fromRGB(172, 85, 255);
    editor.mouse = {
      dragging: false,
      downAt: null
    };
    editor.pressedKeys = {};
    editor.currentTool = "pencil";
    editor.currentCellToStartFill = null;
    editor.currentBrushSize = 1;
    editor.cellHistory = CellHistory.init(editor);
    
    editor.tickInterval = 30; // ms/frame
    editor.widthInCells = 16; // cells
    editor.heightInCells = 16; // cells
    editor.cellSize = 30; // pixels
    
    Object.extend(editor, {
      init: function() {
        var self = this;
        self.container = $('main');
        self._initCells();
        self._createWrapperDivs();
        self._createGridCanvas();
        self._createCanvas();
        self._createToolBox();
        self._createBrushSizesBox();
        self._createColorBox();
        self._createPreviewBox();
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
        self._highlightCurrentCells();
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
            row[j] = new Cell(self, j, i);
          }
        }
      },
      
      _createWrapperDivs: function() {
        var self = this;
        
        self.leftPane = document.createElement("div");
        self.leftPane.id = "left_pane";
        self.container.appendChild(self.leftPane);
        
        self.rightPane = document.createElement("div");
        self.rightPane.id = "right_pane";
        self.container.appendChild(self.rightPane);
        
        self.centerPane = document.createElement("div");
        self.centerPane.id = "center_pane";
        self.container.appendChild(self.centerPane);
      },
      
      _createGridCanvas: function() {
        var self = this;
        self.gridCanvas = Canvas.create(self.cellSize, self.cellSize, function(c) {
          c.ctx.strokeStyle = "#eee";
          c.ctx.beginPath();
            // Draw a vertical line on the left
            // We use 0.5 instead of 0 because this is the midpoint of the path we want to stroke
            // See: <http://diveintohtml5.org/canvas.html#pixel-madness>
            c.ctx.moveTo(0.5, 0);
            c.ctx.lineTo(0.5, c.element.height);
            // Draw a horizontal line on top
            c.ctx.moveTo(0, 0.5);
            c.ctx.lineTo(c.element.width, 0.5);
          c.ctx.stroke();
          c.ctx.closePath();
        });
      },
      
      _createCanvas: function() {
        var self = this;
        self.width = self.widthInCells * self.cellSize;
        self.height = self.heightInCells * self.cellSize;
        self.canvas = Canvas.create(self.width, self.height);
        self.canvas.element.id = "enlarged_canvas";
        self.canvas.element.style.backgroundImage = 'url('+self.gridCanvas.element.toDataURL("image/png")+')';
        self.centerPane.appendChild(self.canvas.element);
      },
      
      _createColorBox: function() {
        var self = this;
        
        var boxDiv = document.createElement("div");
        boxDiv.id = "color_box";
        boxDiv.className = "box";
        self.rightPane.appendChild(boxDiv);
        
        var h3 = document.createElement("h3");
        h3.innerHTML = "Color";
        boxDiv.appendChild(h3);
        
        var colorSampleDiv = document.createElement("div");
        colorSampleDiv.style.backgroundColor = 'rgb('+self.currentColor.toRGBString()+')';
        colorSampleDiv.id = "color_sample";
        
        var possibleColorSliders = {
          rgb: [
            {name: "red", max: 255},
            {name: "green", max: 255},
            {name: "blue", max: 255}
          ],
          hsl: [
            {name: "hue", max: 360},
            {name: "saturation", max: 100},
            {name: "lightness", max: 100}
          ]
        };
        var colorSliders = {
          rgb: {
            red: {},
            green: {},
            blue: {}
          },
          hsl: {
            hue: {},
            saturation: {},
            lightness: {}
          }
        };
        _.each(possibleColorSliders, function(components, ctype) {
          var colorControlsDiv = document.createElement("div");
          colorControlsDiv.id = ctype + "_color_controls";
          colorControlsDiv.className = "color_controls";
          boxDiv.appendChild(colorControlsDiv);
          
          _.each(components, function(component) {
            var colorDiv = document.createElement("div");
            colorControlsDiv.appendChild(colorDiv);
            
            var label = document.createElement("label");
            label.innerHTML = String.capitalize(component.name);
            colorDiv.appendChild(label);

            var colorSlider = document.createElement("input");
            colorSlider.type = "range";
            colorSlider.min = 0;
            colorSlider.max = component.max;
            colorSlider.value = self.currentColor[component.name];
            colorDiv.appendChild(colorSlider);
            colorSliders[ctype][component.name].slider = colorSlider;

            var colorValueSpan = document.createElement("span");
            colorValueSpan.innerHTML = self.currentColor[component.name];
            colorDiv.appendChild(document.createTextNode(" "))
            colorDiv.appendChild(colorValueSpan);
            colorSliders[ctype][component.name].sliderSpan = colorValueSpan;

            bean.add(colorSlider, 'change', function() {
              self.currentColor[component.name] = colorSlider.value;
              if (ctype == "rgb") {
                self.currentColor.refreshHSL();
              } else {
                self.currentColor.refreshRGB();
              }
              _.each(colorSliders[ctype == "rgb" ? "hsl" : "rgb"], function(o, componentName) {
                var val = self.currentColor[componentName];
                // Hue may be null, so check for that
                if (val !== null) o.slider.value = o.sliderSpan.innerHTML = val;
              });
              colorValueSpan.innerHTML = self.currentColor[component.name];
              colorSampleDiv.style.backgroundColor = 'rgb('+self.currentColor.toRGBString()+')';
            })
          })
        })
        
        /*
        var colorSpectrum = Canvas.create(300, 300, function(c) {
          for (var r=0; r<255; r++) {
            for (var g=0; g<255; g++) {
              for (var b=0; b<255; b++) {
                
              }
            }
          }
        })
        */
        
        boxDiv.appendChild(colorSampleDiv);
      },
      
      _createPreviewBox: function() {
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
      
      _createToolBox: function() {
        var self = this;
        
        var boxDiv = document.createElement("div");
        boxDiv.id = "tool_box";
        boxDiv.className = "box";
        self.leftPane.appendChild(boxDiv);
        
        var h3 = document.createElement("h3");
        h3.innerHTML = "Toolbox";
        boxDiv.appendChild(h3);
        
        var ul = document.createElement("ul");
        boxDiv.appendChild(ul);
        
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
      },
      
      _createBrushSizesBox: function() {
        var self = this;
        
        var boxDiv = document.createElement("div");
        boxDiv.id = "sizes_box";
        boxDiv.className = "box";
        self.leftPane.appendChild(boxDiv);
        
        var h3 = document.createElement("h3");
        h3.innerHTML = "Sizes";
        boxDiv.appendChild(h3);
        
        var grids = []
        _.each([1, 2, 3, 4], function(brushSize) {
          var grid = Grid.create(self, self.cellSize*brushSize, self.cellSize*brushSize);
          grids.push(grid);
          boxDiv.appendChild(grid.element);
          bean.add(grid.element, 'click', function() {
            self.currentBrushSize = brushSize;
            _.each(grids, function(grid) { grid.element.className = grid.element.className.replace("selected", "") })
            grid.element.className += " selected";
          })
          if (self.currentBrushSize == brushSize) bean.fire(grid.element, 'click');
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
            
            self._setCurrentCells(mouse);
            
            // If dragging isn't set yet, set it until the mouse is lifted off
            if (self.mouse.downAt) {
              if (!self.mouse.dragging) {
                self.mouse.dragging = (self._distance(self.mouse.downAt, mouse) > 3);
                self.selectedCells = [];
              }
            } else {
              self.mouse.dragging = false;
            }
            
            if (self.mouse.dragging && self.currentTool == "pencil") {
              // FIXME: If you drag too fast it will skip some cells!
              // Use the current mouse position and the last mouse position and
              //  fill in or erase cells in between.
              if (event.rightClick || self.pressedKeys[16]) {
                self._setCurrentCellsToUnfilled();
              } else {
                self._setCurrentCellsToFilled();
              }
            }
          },
          mousedown: function(event) {
            self.mouse.downAt = {x: event.pageX, y: event.pageY};
            self.cellHistory.open();
            event.preventDefault();
          },
          mouseup: function(event) {
            if (!self.mouse.dragging) {
              switch (self.currentTool) {
                case "pencil":
                  if (event.rightClick || self.pressedKeys[16]) {
                    self._setCurrentCellsToUnfilled();
                  } else {
                    self._setCurrentCellsToFilled();
                  }
                  break;
                case "bucket":
                  if (event.rightClick || self.pressedKeys[16]) {
                    self._setCellsLikeCurrentToUnfilled();
                  } else {
                    self._setCellsLikeCurrentToFilled();
                  }
                  break;
              }
            }
            self.cellHistory.close();
            self.mouse.downAt = null;
            event.preventDefault();
          },
          mouseout: function(event) {
            self._unsetCurrentCells();
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
            if (event.keyCode == 90 && (event.ctrlKey || event.metaKey)) {
              // Undo last action
              self.cellHistory.undo();
            }
          },
          keyup: function(event) {
            delete self.pressedKeys[event.keyCode];
          }
        });
        bean.add(window, {
          blur: function() {
            self.stop();
          }
        })
      },
      
      _setCurrentCells: function(mouse) {
        var self = this;
        
        var bs = (self.currentBrushSize-1) * self.cellSize;
        var x = (mouse.x - self.canvas.element.offsetLeft);
        var y = (mouse.y - self.canvas.element.offsetTop);
        
        var currentCells = [];
        // Make a bounding box of pixels within the enlarged canvas based on
        // the brush size
        var x1 = x - (bs / 2),
            x2 = x + (bs / 2),
            y1 = y - (bs / 2),
            y2 = y + (bs / 2);
        // Scale each enlarged coord down to the actual pixel value
        // on the sprite
        var j1 = Math.floor(x1 / self.cellSize),
            j2 = Math.floor(x2 / self.cellSize),
            i1 = Math.floor(y1 / self.cellSize),
            i2 = Math.floor(y2 / self.cellSize);
        // Now that we have a bounding box of pixels, enumerate through all
        // pixels in this bounding box
        for (var i=i1; i<=i2; i++) {
          for (var j=j1; j<=j2; j++) {
            var row = self.cells[i];
            if (row && row[j]) {
              currentCells.push(row[j]);
            }
          }
        }
        self.currentCells = currentCells;
      },
      
      _unsetCurrentCells: function() {
        var self = this;
        self.currentCells = null;
      },
      
      _setCurrentCellsToFilled: function() {
        var self = this;
        if (self.currentCells) {
          _.each(self.currentCells, function(cell) {
            self.cellHistory.add(cell);
            // Clone so when changing the current color we don't change all cells
            // filled with that color
            cell.color = self.currentColor.clone();
          })
        }
      },
      
      _setCurrentCellsToUnfilled: function() {
        var self = this;
        if (self.currentCells) {
          _.each(self.currentCells, function(cell) {
            self.cellHistory.add(cell);
            cell.color = null;
          })
        }
      },
      
      _setCellsLikeCurrentToFilled: function() {
        var self = this;
        // Copy this as the color of the current cell will change during this loop
        var currentCellColor = self.currentCells[0].color;
        if (currentCellColor) currentCellColor = currentCellColor.clone();
        // Look for all cells with the color (or non-color) of the current cell
        // and mark them as filled with the current color
        _.each(self.cells, function(row, i) {
          _.each(row, function(cell, j) {
            if ((!cell.color && !currentCellColor) || cell.color.isEqual(currentCellColor)) {
              cell.color = self.currentColor.clone();
            }
          })
        })
      },
      
      _setCellsLikeCurrentToUnfilled: function() {
        var self = this;
        // Copy this as the color of the current cell will change during this loop
        var currentCellColor = self.currentCells[0].color;
        if (currentCellColor) currentCellColor = currentCellColor.clone();
        // Look for all cells with the color of the current cell
        // and mark them as unfilled
        _.each(self.cells, function(row, i) {
          _.each(row, function(cell, j) {
            if (cell.color && cell.color.isEqual(currentCellColor)) {
              cell.color = null;
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
      
      _highlightCurrentCells: function() {
        var self = this;
        var ctx = self.canvas.ctx;
        if (self.currentCells && !(self.mouse.dragging || self.pressedKeys[16]) && self.currentTool == "pencil") {
          ctx.save();
            ctx.fillStyle = 'rgba('+self.currentColor.toRGBString()+',0.5)';
            _.each(self.currentCells, function(cell) {
              ctx.fillRect(cell.enlarged.x+1, cell.enlarged.y+1, self.cellSize-1, self.cellSize-1);
            })
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
                c.ctx.fillStyle = 'rgb('+cell.color.toRGBString()+')';
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
      
      _distance: function(v1, v2) {
        return Math.sqrt(Math.pow((v2.y - v1.y), 2) + Math.pow((v2.x - v1.x), 2));
      }
    })
    
    return editor;
  })();

})(window, window.document, window.$, window._);