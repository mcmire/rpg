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
    
    addKeyHandler: function() {
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
    game.ready = false;
    
    game.tickInterval = 30; // ms/frame
    //game.tickInterval = 150; // ms/frame
    
    game.tileSize = 32; // pixels
    
    game.viewport = {};
    game.viewport.widthInTiles = 24;
    game.viewport.heightInTiles = 16;
    game.viewport.widthInPixels = game.viewport.widthInTiles * game.tileSize;
    game.viewport.heightInPixels = game.viewport.heightInTiles * game.tileSize;
    
    game.map = {
      widthInTiles: game.viewport.widthInTiles * 15,
      heightInTiles: game.viewport.heightInTiles * 15,
      widthInPixels: game.viewport.widthInPixels * 15,
      heightInPixels: game.viewport.heightInPixels * 15,
      data: [],
      location: {i: 0, j: 0}
    };
    
    game.bg = {
      canvas: null,
      ctx: null,
      offset: {x: 0, y: 0},
      needsRegenerating: true
    }
    // The frame size is the distance between the edge of the viewport and the
    // edge of the background, i.e., it's a measure of how much bigger the
    // background is compared to the viewport
    game.bg.frame = {}
    game.bg.frame.sizeInTiles = 10;
    game.bg.frame.sizeInPixels = game.bg.frame.sizeInTiles * game.tileSize;
    
    game.player = {
      pos: {x: 0, y: 0},
      velocity: 5
    };
    
    game.imagePath = "images";
    game.sprite = {
      names: ["grass", "snow", "water", "player"],
      instances: {}
    };
    
    Object.extend(game, {
      init: function(callback) {
        var self = this;

        self.canvas = document.createElement("canvas");
        self.ctx = self.canvas.getContext("2d");
        self.canvas.width = self.viewport.widthInPixels;
        self.canvas.height = self.viewport.heightInPixels;
        document.body.appendChild(self.canvas);
        
        self._initKeyboard();
        
        self._generateMap();
        
        // Initialize the background offset
        self.bg.offset.x = self.bg.offset.y = -self.bg.frame.sizeInPixels;
        console.log("bg.offset.x: " + self.bg.offset.x);
        
        // Initialize the player position
        self.player.pos.x = self.viewport.widthInPixels / 2;
        self.player.pos.y = self.viewport.heightInPixels / 2;
        
        // Cache all the images so that we are not loading them while the user
        // plays the game
        self._preloadImages();
      },
      
      ready: function(callback) {
        var self = this;
        // Keep checking the flag that we set in _preloadImages().
        // When it's true then we are ready to continue.
        var timer = setInterval(function() {
          if (self.ready) {
            clearInterval(timer);
            callback();
          }
        }, 100);
      },

      run: function() {
        var self = this;
        // Start the game loop
        setInterval(function() { self._redraw() }, self.tickInterval);
        //self._redraw();
      },

      _generateMap: function() {
        var self = this;
        var bgSpriteNames = _.reject(self.sprite.names, function(n) { return n == "player" });
        for (var i=0; i<self.map.heightInTiles; i++) {
          var row = self.map.data[i] = [];
          for (var j=0; j<self.map.widthInTiles; j++) {
            // Pick a random sprite
            var spriteName = bgSpriteNames[Math.randomInt(0, bgSpriteNames.length-1)];
            row[j] = spriteName;
          }
        }
      },

      _preloadImages: function() {
        var self = this;
        for (var i=0; i<self.sprite.names.length; i++) {
          (function(i) {
            var name = self.sprite.names[i];
            var image = new Image(self.tileSize, self.tileSize);
            image.src = self.imagePath + "/" + name + ".gif";
            image.onload = function() {
              if (i == self.sprite.names.length-1) self.ready = true;
            }
            self.sprite.instances[name] = image;
          })(i)
        }
      },

      _redraw: function() {
        var self = this;
        
        // Respond to keystrokes executed during the "dead time", i.e., the time
        // between the end of last iteration and the start of this iteration
        Keyboard.runHandlers();
        
        // Draw the background
        if (self.bg.needsRegenerating) self._generateBackground();
        self.ctx.drawImage(self.bg.canvas, self.bg.offset.x, self.bg.offset.y);
        
        // Draw the player
        self.ctx.drawImage(self.sprite.instances["player"], self.player.pos.x, self.player.pos.y);
      },
      
      _initKeyboard: function() {
        var self = this;
        
        Keyboard.init(self);
        
        Keyboard.addKeyHandler('A_KEY', 'LEFT_ARROW', function() {
          //self.bg.offset.x += self.player.velocity;
          
          // If the lefthand bound of the background image would cross the
          // lefthand bound of the viewport...
          if ((self.bg.offset.x + self.player.velocity) >= 0) {
            // Go ahead and shift the background rightward internally...
            self.bg.offset.x += self.player.velocity;
            
            // ...but before we render the background, let's generate another
            // column of tiles on the left side of the background image and chop
            // off the rightmost column.
            
            // To do this, we need to change the column index of the map.
            self.map.location.j -= self.bg.frame.sizeInTiles;
            
            // We also need to make a new Canvas object -- we're going to replace
            // the current background with this.
            var bg = self._newBackgroundCanvas();
            
            // On this new canvas, we first draw the new column (we're just
            // figuring out which sprites to populate it with by using the map
            // that we've already generated).
            var newColumn = self._newCanvas(self.bg.frame.sizeInPixels, self.bg.heightInPixels);
            for (var i=0; i<self.bg.heightInTiles; i++) {
              for (var j=0; j<self.bg.frame.sizeInTiles; j++) {
                var spriteName = self.map.data[self.map.location.i+i][self.map.location.j+j];
                var sprite = self.sprite.instances[spriteName];
                bg.ctx.drawImage(sprite, j*self.tileSize, i*self.tileSize);
              }
            }
            
            // Then we can take the current canvas and draw it to the right of
            // the new column.
            bg.ctx.drawImage(self.bg.canvas, self.bg.frame.sizeInPixels, 0);
            
            // So now, we replace the current canvas.
            self.bg.canvas = bg.canvas;
            self.bg.ctx = bg.ctx;
            
            // One more thing. The offset of this new background is going to be
            // different than the current offset, because the current offset
            // doesn't apply anymore since we've tacked something else onto the
            // image and thus changed all the coordinates. Remember that the
            // offset right now is past 0 (that's why we're in this branch of
            // the code), so we just need to subtract whatever it is and then
            // subtract the amount that we've tacked on.
            self.bg.offset.x = -self.bg.offset.x - self.bg.frame.sizeInPixels;
          }
          else {
            self.bg.offset.x += self.player.velocity;
          }
          
          console.log("bg.offset.x: " + self.bg.offset.x);
        });
        Keyboard.addKeyHandler('D_KEY', 'RIGHT_ARROW', function() {
          self.bg.offset.x -= self.player.velocity;
          //if (self.bg.offset.x > self.map.widthInPixels) {
          //  self.bg.offset.x = self.map.widthInPixels;
          //}
        });
        Keyboard.addKeyHandler('W_KEY', 'UP_ARROW', function() {
          self.bg.offset.y += self.player.velocity;
          //if (self.bg.offset.y < 0) {
          //  self.bg.offset.y = 0;
          //}
        });
        Keyboard.addKeyHandler('S_KEY', 'DOWN_ARROW', function() {
          self.bg.offset.y -= self.player.velocity;
          //if (self.bg.offset.y > self.map.heightInPixels) {
          //  self.bg.offset.y = self.map.heightInPixels;
          //}
        });
      },
      
      // One of the things we need to during our game loop is to redraw the
      // background. The thing is, the background is made up of tiles, and
      // redrawing every tile of the background every iteration is really not
      // optimal. For instance, if our tickInterval is 30ms, and our viewport
      // is 24 tiles x 16 tiles, that means we'd be making about 12,700 draw
      // calls every second. Yikes! We can fix this by taking advantage of
      //the fact that Canvas's drawImage() function accepts a Canvas object as
      // an argument (instead of an Image object which you are probably used to
      // using). So basically, we concatenate the background (which is just the
      // part of the map clipped by the viewport) into one Canvas object and
      // then redraw *that* every iteration. Much better!
      //
      _generateBackground: function() {
        var self = this;
        
        Object.extend(self.bg, self._newBackgroundCanvas());
        
        // Pick a random point on the map
        var i1 = Math.randomInt(0, self.map.heightInTiles - self.bg.heightInTiles - 1);
        var i2 = i1 + self.bg.heightInTiles;
        var j1 = Math.randomInt(0, self.map.widthInTiles - self.bg.widthInTiles - 1);
        var j2 = j1 + self.bg.widthInTiles;
        // Store the current indices as this will come in handy when generating
        // more of the background later
        self.map.location.i = i1;
        self.map.location.j = j1;
        
        // Fill up the viewport with the tiles on the map within the range that
        // we've chosen
        for (var i=i1, tx=0; i<i2; i++, tx++) {
          for (var j=j1, ty=0; j<j2; j++, ty++) {
            var spriteName = self.map.data[i][j];
            var sprite = self.sprite.instances[spriteName];
            self.bg.ctx.drawImage(sprite, ty*self.tileSize, tx*self.tileSize);
          }
        }
        
        self.bg.needsRegenerating = false;
      },
      
      _newBackgroundCanvas: function() {
        var self = this;
        return self._newCanvas(
          (self.viewport.widthInTiles + (self.bg.frame.sizeInTiles * 2)) * self.tileSize,
          (self.viewport.heightInTiles + (self.bg.frame.sizeInTiles * 2)) * self.tileSize
        );
      },
      
      _newCanvas: function(width, height) {
        var self = this;
        var o = {};
        o.canvas = document.createElement("canvas");
        o.ctx    = o.canvas.getContext("2d");
        o.widthInPixels  = o.canvas.width = width;
        o.heightInPixels = o.canvas.height = height;
        o.widthInTiles   = o.widthInPixels / self.tileSize;
        o.heightInTiles  = o.heightInPixels / self.tileSize;
        return o;
      }
    })
    
    return game;
  })();

  $(function() {
    Game.init();
    Game.ready(function() { Game.run() });
  })
  
})(window, window.document, window.$, window._);