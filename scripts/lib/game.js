(function(window, document, $, _, undefined) {
  
  window.Keyboard = {
    keys: {
      LEFT_ARROW: 37,
      RIGHT_ARROW: 39,
      UP_ARROW: 38,
      DOWN_ARROW: 40,
      A_KEY: 65,
      D_KEY: 68, 
      W_KEY: 87,
      S_KEY: 83
    },
    
    game: null,
    globalKeyHandler: null,
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
          if (self.globalKeyHandler) self.globalKeyHandler();
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
    
    addKeyHandler: function(/* [key1, key2, ..., ]callback */) {
      var self = this;
      var keyNames = Array.prototype.slice.call(arguments);
      var callback = keyNames.pop();
      if (_.any(keyNames)) {
        _.each(keyNames, function(keyName) {
          self.keyHandlers[self.keys[keyName]] = callback;
        })
      } else {
        self.globalKeyHandler = callback;
      }
    }
  };
  
  window.Game = (function() {
    var game = {};
    
    // Here are the variables that we'll we working with.
    // Some of these we don't technically need to initialize, they're just
    //  here for documentation.
    
    game.canvas = null;
    game.ctx = null;
    
    game.mapLoaded = false;
    game.imagesLoaded = false;
    
    game.tickInterval = 30; // ms/frame
    //game.tickInterval = 150; // ms/frame
    
    game.tileSize = 32; // pixels
    
    game.viewport = {
      height: null,
      width: null,
      bounds: {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0
      },
      playerPadding: 30
    };
    
    game.map = {
      data: []
    };
    
    game.bg = {
      canvas: null,
      ctx: null,
      offset: {x: 0, y: 0}
    }
    
    game.player = {
      viewport: {
        pos: {x: 0, y: 0},
        offset: {x: 0, y: 0},
        fenceDistance: null
      },
      map: {
        pos: {x: 0, y: 0}
      },
      speed: 10
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

        // Initialize the dimensions of the viewport
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
          
          // Initialize the dimensions of the map based on the data
          self.map.width = self._dim(self.map.data[0].length, 'tiles');
          self.map.height = self._dim(self.map.data.length, 'tiles');

          // Initialize the player's position within the viewport
          self.player.viewport.pos.x = self.viewport.width.pixels / 2;
          self.player.viewport.pos.y = self.viewport.height.pixels / 2;
          // Initialize the "fence distance" -- the distance the player can
          // travel from the center of the viewport to the edge of the viewport
          // before it starts scrolling
          self.player.viewport.fenceDistance = (self.viewport.width.pixels / 2) - self.viewport.playerPadding;

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
        
        // Initialize the player's position on the map
        self.player.map.pos.x = self.viewport.bounds.x1 + (self.viewport.width.pixels / 2);
        self.player.map.pos.y = self.viewport.bounds.y1 + (self.viewport.width.pixels / 2);
        
        self._debugViewport();
        self._debugPlayer();
        
        // Start the game loop
        setInterval(function() { self._redraw() }, self.tickInterval);
        //self._redraw();
      },

      _loadMap: function(callback) {
        get('scripts/lib/map.js', function(code) {
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
        self.ctx.drawImage(self.map.canvas, -self.viewport.bounds.x1, -self.viewport.bounds.y1);
        
        // Draw the player
        self.ctx.drawImage(self.sprite.instances["player"], self.player.viewport.pos.x, self.player.viewport.pos.y);
      },
      
      _initKeyboard: function() {
        var self = this;
        
        Keyboard.init(self);
        
        /*
        Keyboard.addKeyHandler(function() {
          self._debugViewport();
          self._debugPlayer();
        })
        */
        Keyboard.addKeyHandler('A_KEY', 'LEFT_ARROW', function() {
          // The idea here is that we move the player sprite left until it
          // reaches a certain point (we call it the "fence"), after which we
          // continue the appearance of movement by shifting the viewport
          // leftward along the map. We do this until we've reached the left
          // edge of the map and can scroll no longer, at which point we move
          // the player left until it touches the left edge of the map.
          //
          if ((self.viewport.bounds.x1 - self.player.speed) >= 0) {
            if ((self.player.viewport.pos.x - self.player.speed) >= self.viewport.playerPadding) {
              // Move player left
              self.player.viewport.pos.x -= self.player.speed;
              self.player.viewport.offset.x -= self.player.speed;
            } else {
              // Player has hit fence: shift viewport left
              self.viewport.bounds.x1 -= self.player.speed;
              self.viewport.bounds.x2 -= self.player.speed;
            }
            self.player.map.pos.x -= self.player.speed;
          } else if ((self.player.viewport.pos.x - self.player.speed) >= 0) {
            // Left edge of map hit: move player left
            self.player.viewport.pos.x -= self.player.speed;
            self.player.viewport.offset.x -= self.player.speed;
            self.player.map.pos.x -= self.player.speed;
          } else {
            // Put player at left edge of map
            self.player.viewport.pos.x -= self.player.viewport.pos.x;
            self.player.viewport.offset.x -= self.player.viewport.pos.x;
            self.player.map.pos.x -= self.player.viewport.pos.x;
          }
        });
        Keyboard.addKeyHandler('D_KEY', 'RIGHT_ARROW', function() {
          // Similar to moving leftward, we move the player sprite right until
          // it hits the fence, after which we continue the appearance of
          // movement by shifting the viewport rightward along the map. We do
          // this until we've reached the right edge of the map and can scroll
          // no longer, at which point we move the player right until it touches
          // the right edge of the map.
          //
          if ((self.viewport.bounds.x2 + self.player.speed) <= self.map.width.pixels) {
            if ((self.viewport.width.pixels - (self.player.viewport.pos.x + self.tileSize + self.player.speed)) >= self.viewport.playerPadding) {
              // Move player right
              self.player.viewport.pos.x += self.player.speed;
              self.player.viewport.offset.x += self.player.speed;
            } else {
              // Player has hit fence: shift viewport right
              self.viewport.bounds.x1 += self.player.speed;
              self.viewport.bounds.x2 += self.player.speed;
            }
            self.player.map.pos.x += self.player.speed;
          } else {
            var dist = (self.player.viewport.pos.x + self.tileSize) - self.viewport.width.pixels;
            if ((dist + self.player.speed) < 0) {
              // Right edge of map hit: move player right
              self.player.viewport.pos.x += self.player.speed;
              self.player.viewport.offset.x += self.player.speed;
              self.player.map.pos.x += self.player.speed;
            } else {
              // Put player at right edge of map
              self.player.viewport.pos.x += -dist;
              self.player.viewport.offset.x += -dist;
              self.player.map.pos.x += -dist;
            }
          }
        });
        Keyboard.addKeyHandler('W_KEY', 'UP_ARROW', function() {
          // Similar to moving leftward, we move the player sprite upward until
          // it hits the fence, after which we continue the appearance of
          // movement by shifting the viewport upward along the map. We do
          // this until we've reached the top edge of the map and can scroll
          // no longer, at which point we move the player up until it touches
          // the top edge of the map.
          //
          if ((self.viewport.bounds.y1 - self.player.speed) >= 0) {
            if ((self.player.viewport.pos.y - self.player.speed) >= self.viewport.playerPadding) {
              // Move player up
              self.player.viewport.pos.y -= self.player.speed;
              self.player.viewport.offset.y -= self.player.speed;
            } else {
              // Player has hit fence: shift viewport up
              self.viewport.bounds.y1 -= self.player.speed;
              self.viewport.bounds.y2 -= self.player.speed;
            }
            self.player.map.pos.y -= self.player.speed;
          } else if ((self.player.viewport.pos.y - self.player.speed) >= 0) {
            // Left edge of map hit: move player up
            self.player.viewport.pos.y -= self.player.speed;
            self.player.viewport.offset.y -= self.player.speed;
            self.player.map.pos.y -= self.player.speed;
          } else {
            // Put player at top edge of map
            self.player.viewport.pos.y -= self.player.viewport.pos.y;
            self.player.viewport.offset.y -= self.player.viewport.pos.y;
            self.player.map.pos.y -= self.player.viewport.pos.y;
          }
        });
        Keyboard.addKeyHandler('S_KEY', 'DOWN_ARROW', function() {
          // Similar to moving leftward, we move the player sprite downward
          // until it hits the fence, after which we continue the appearance of
          // movement by shifting the viewport downard along the map. We do
          // this until we've reached the bottom edge of the map and can scroll
          // no longer, at which point we move the player down until it touches
          // the bottom edge of the map.
          //
          if ((self.viewport.bounds.y2 + self.player.speed) <= self.map.height.pixels) {
            if ((self.viewport.height.pixels - (self.player.viewport.pos.y + self.tileSize + self.player.speed)) >= self.viewport.playerPadding) {
              // Move player down
              self.player.viewport.pos.y += self.player.speed;
              self.player.viewport.offset.y += self.player.speed;
            } else {
              // Player has hit fence: shift viewport down
              self.viewport.bounds.y1 += self.player.speed;
              self.viewport.bounds.y2 += self.player.speed;
            }
            self.player.map.pos.y += self.player.speed;
          } else {
            var dist = (self.player.viewport.pos.y + self.tileSize) - self.viewport.height.pixels;
            if ((dist + self.player.speed) < 0) {
              // Bottom edge of map hit: move player down
              self.player.viewport.pos.y += self.player.speed;
              self.player.viewport.offset.y += self.player.speed;
              self.player.map.pos.y += self.player.speed;
            } else {
              // Put player at bottom edge of map
              self.player.viewport.pos.y += -dist;
              self.player.viewport.offset.y += -dist;
              self.player.map.pos.y += -dist;
            }
          }
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
        self.viewport.bounds.x1 = Math.randomInt(0, self.map.width.pixels - self.viewport.width.pixels);
        self.viewport.bounds.x2 = self.viewport.bounds.x1 + self.viewport.width.pixels;
        self.viewport.bounds.y1 = Math.randomInt(0, self.map.height.pixels - self.viewport.height.pixels);
        self.viewport.bounds.y2 = self.viewport.bounds.y1 + self.viewport.height.pixels;
      },
      
      _debugViewport: function() {
        var self = this;
        console.log("self.viewport.bounds = (" + self.viewport.bounds.x1 + ".." + self.viewport.bounds.x2 + ", " + self.viewport.bounds.y1 + ".." + self.viewport.bounds.y2 + ")");
      },
      
      _debugPlayer: function() {
        var self = this;
        console.log("self.player.viewport.pos = (" + self.player.viewport.pos.x + ", " + self.player.viewport.pos.y + ")");
        console.log("self.player.viewport.offset = (" + self.player.viewport.offset.x + ", " + self.player.viewport.offset.y + ")");
        console.log("self.player.map.pos = (" + self.player.map.pos.x + ", " + self.player.map.pos.y + ")");
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
