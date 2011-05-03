(function(window, document, $, _, undefined) {
  
  window.Keyboard = {
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    A_KEY: 65,
    D_KEY: 68, 
    W_KEY: 87,
    S_KEY: 83,
    
    game: null,
    keyHandlers: {},
    activeKeyHandlers: {},
    
    init: function(game) {
      var self = this;
      self.game = game;
      
      bean.add(document, 'keydown', function(event) {
        var key = event.keyCode;
        if (key in self.keyHandlers) {
          if (!(key in self.activeKeyHandlers)) {
            self.activeKeyHandlers[key] = self.keyHandlers[key];
          }
          event.preventDefault();
        }
      });
      
      bean.add(document, 'keyup', function(event) {
        var key = event.keyCode;
        delete self.activeKeyHandlers[key];
        event.preventDefault();
      })
      
      bean.add(window, 'blur', function(event) {
        // Clear all the handlers to prevent stuck keys
        self.activeKeyHandlers = {};
      })
    },
    
    runHandlers: function() {
      var self = this;
      for (key in self.activeKeyHandlers) {
        self.activeKeyHandlers[key]();
      }
    },
    
    addKeyHandler: function(/* key1, key2, ..., callback */) {
      var self = this;
      var keyNames = Array.prototype.slice.call(arguments);
      var callback = keyNames.pop();
      for (var i=0; i<keyNames.length; i++) {
        self.keyHandlers[self[keyNames[i]]] = callback;
      }
    }
  };
  
  window.Game = (function() {
    var game = {};
    
    game.canvas = null;
    game.ctx = null;
    
    game.mapLoaded = false;
    game.imagesLoaded = false;
    
    game.tickInterval = 30; // ms/frame
    //game.tickInterval = 150; // ms/frame
    
    game.tileSize = 32; // pixels
    
    game.viewport = {};
    
    game.map = {
      data: [],
      location: {
        x: 0,
        y: 0,
        i: 0,
        j: 0
      }
    };
    
    game.bg = {
      canvas: null,
      ctx: null,
      offset: {x: 0, y: 0}
    }
    
    game.player = {
      pos: {x: 0, y: 0},
      speed: 5
    };
    
    game.imagePath = "images";
    game.sprite = {
      names: ["player"],
      instances: {}
    };

    game.mapTiles = {
      names: ["grass", "snow", "water", "dirt"],
      instances: []
    }
    
    Object.extend(game, {
      init: function(callback) {
        var self = this;

        self.viewport.width = self._dim(24, 'tiles');
        self.viewport.height = self._dim(16, 'tiles');
        //self.map.width = self._dim(self.viewport.height.tiles * 5, 'tiles');
        //self.map.height = self._dim(self.viewport.width.tiles * 5, 'tiles')

        self.canvas = document.createElement("canvas");
        self.ctx = self.canvas.getContext("2d");
        self.canvas.width = self.viewport.width.pixels;
        self.canvas.height = self.viewport.height.pixels;
        document.body.appendChild(self.canvas);
        
        self._initKeyboard();
        
        self._loadMap(function() {
          self.mapLoaded = true;
          
          self.map.width = self._dim(self.map.data[0].length, 'tiles');
          self.map.height = self._dim(self.map.data.length, 'tiles');

          // Initialize the player position
          self.player.pos.x = self.viewport.width.pixels / 2;
          self.player.pos.y = self.viewport.height.pixels / 2;

          // Cache all the images so that we are not loading them while the user
          // plays the game
          self._preloadImages();
        });
      },
      
      ready: function(callback) {
        var self = this;
        // Keep checking the flag that we set in _preloadImages().
        // When it's true then we are ready to continue.
        var timer = setInterval(function() {
          if (self.mapLoaded && self.imagesLoaded) {
            clearInterval(timer);
            callback();
          }
        }, 100);
      },

      run: function() {
        var self = this;
        
        self._renderMap();
        self._initViewport();
        
        // Start the game loop
        setInterval(function() { self._redraw() }, self.tickInterval);
        //self._redraw();
      },

      _loadMap: function(callback) {
        get('/scripts/lib/map.js', function(code) {
          eval(code);
          callback();
        })
      },

      _preloadImages: function() {
        var self = this;
        var i = 0, len = self.sprite.names.length + self.mapTiles.names.length;
        _.each(self.sprite.names, function(name) {
          var image = new Image(self.tileSize, self.tileSize);
          image.src = self.imagePath + "/" + name + ".gif";
          image.onload = function() {
            if (i == len-1) self.imagesLoaded = true;
          }
          self.sprite.instances[name] = image;
          i++;
        });
        _.each(self.mapTiles.names, function(name, i) {
          var image = new Image(self.tileSize, self.tileSize);
          image.src = self.imagePath + "/" + name + ".gif";
          image.onload = function() {
            if (i == len-1) self.imagesLoaded = true;
          }
          self.mapTiles.instances[i] = image;
          i++;
        })
      },

      _redraw: function() {
        var self = this;
        
        // Respond to keystrokes executed during the "dead time", i.e., the time
        // between the end of last iteration and the start of this iteration
        Keyboard.runHandlers();
        
        // Draw the background
        self.ctx.drawImage(self.map.canvas, -self.viewport.x1, -self.viewport.y1);
        
        // Draw the player
        self.ctx.drawImage(self.sprite.instances["player"], self.player.pos.x, self.player.pos.y);
      },
      
      _initKeyboard: function() {
        var self = this;
        
        Keyboard.init(self);
        
        Keyboard.addKeyHandler('A_KEY', 'LEFT_ARROW', function() {
          if ((self.viewport.x1 - self.player.speed) >= 0) {
            self._addToViewportLocation({x: -self.player.speed});
          } else {
            self._addToViewportLocation({x: -self.viewport.x1});
          }
          //self._debugViewportLocation();
        });
        Keyboard.addKeyHandler('D_KEY', 'RIGHT_ARROW', function() {
          if ((self.viewport.x2 + self.player.speed) <= self.map.width.pixels) {
            self._addToViewportLocation({x: self.player.speed});
          } else {
            self._addToViewportLocation({x: self.map.width.pixels-self.viewport.x2});
          }
          //self._debugViewportLocation();
        });
        Keyboard.addKeyHandler('W_KEY', 'UP_ARROW', function() {
          if ((self.viewport.y1 - self.player.speed) >= 0) {
            self._addToViewportLocation({y: -self.player.speed});
          } else {
            self._addToViewportLocation({y: -self.viewport.y1});
          }
          //self._debugViewportLocation();
        });
        Keyboard.addKeyHandler('S_KEY', 'DOWN_ARROW', function() {
          if ((self.viewport.y2 + self.player.speed) <= self.map.height.pixels) {
            self._addToViewportLocation({y: self.player.speed});
          } else {
            self._addToViewportLocation({y: self.map.height.pixels-self.viewport.y2});
          }
          //self._debugViewportLocation();
        });
      },
      
      // One of the things we need to during our game loop is to redraw the
      // map. The thing is, the map is made up of tiles, and redrawing every
      // tile of the map every iteration is really not optimal. We can actually
      // take advantage of the fact that Canvas's drawImage() function accepts
      // a Canvas object as an argument (instead of an Image object which you
      // are probably used to using). So basically, we concatenate the tiles
      // that make up the map into one Canvas object and then we redraw *that*
      // every iteration.
      //
      _renderMap: function() {
        var self = this;
        Object.extend(self.map, self._newCanvas(self.map.width.pixels, self.map.height.pixels));
        
        // Fill up the map canvas with the map data
        for (var i=0; i<self.map.height.tiles; i++) {
          for (var j=0; j<self.map.width.tiles; j++) {
            var tileNumber = self.map.data[i][j];
            var tile = self.mapTiles.instances[tileNumber];
            self.map.ctx.drawImage(tile, j*self.tileSize, i*self.tileSize);
          }
        }
      },
      
      _initViewport: function() {
        var self = this;
        // Pick a random range of pixels on the map for the viewport
        self.viewport.x1 = Math.randomInt(0, self.map.width.pixels - self.viewport.width.pixels);
        self.viewport.x2 = self.viewport.x1 + self.viewport.width.pixels;
        self.viewport.y1 = Math.randomInt(0, self.map.height.pixels - self.viewport.height.pixels);
        self.viewport.y2 = self.viewport.y1 + self.viewport.height.pixels;
      },
      
      _addToViewportLocation: function(vector) {
        var self = this;
        if (typeof vector.x != "undefined") {
          self.viewport.x1 += vector.x;
          self.viewport.x2 += vector.x;
        }
        if (typeof vector.y != "undefined") {
          self.viewport.y1 += vector.y;
          self.viewport.y2 += vector.y;
        }
      },
      
      _debugViewportLocation: function() {
        var self = this;
        console.log("self.viewport.x = (" + self.viewport.x1 + " .. " + self.viewport.x2 + ")");
        console.log("self.viewport.y = (" + self.viewport.y1 + " .. " + self.viewport.y2 + ")");
      },
      
      _newCanvas: function(width, height) {
        var self = this;
        var o = {};
        o.canvas = document.createElement("canvas");
        o.ctx    = o.canvas.getContext("2d");
        o.canvas.width  = width;
        o.canvas.height = height;
        o.width  = self._dim(width, "pixels");
        o.height = self._dim(height, "pixels");
        return o;
      },
      
      _dim: function(value, unit) {
        var self = this;
        var d = {};
        switch(unit) {
          case "tile", "tiles":
            d.tiles = value;
            d.pixels = value * self.tileSize;
            break;
          case "pixel", "pixels":
            d.pixels = value;
            d.tiles = value / self.tileSize;
            break;
        }
        return d;
      }
    })
    
    return game;
  })();

  $(function() {
    Game.init();
    Game.ready(function() { Game.run() });
  })
  
})(window, window.document, window.$, window._);
