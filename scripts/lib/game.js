(function(window, document, $, _, undefined) {
  
  window.Keyboard = {
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    KEY_A: 65,
    KEY_D: 68, 
    KEY_W: 87,
    KEY_S: 83
  };
  
  window.Game = (function() {
    var canvas, ctx;
    var images = {}, ready;
    var background;
    var playerPos = {x: 0, y: 0};
    
    var activeKeyHandlers = {};
    var keyHandlers = {};
    keyHandlers[Keyboard.LEFT_ARROW]  =
    keyHandlers[Keyboard.KEY_A]       = function() { playerPos.x -= 5 }
    keyHandlers[Keyboard.RIGHT_ARROW] = 
    keyHandlers[Keyboard.KEY_D]       = function() { playerPos.x += 5 }
    keyHandlers[Keyboard.UP_ARROW]    = 
    keyHandlers[Keyboard.KEY_W]       = function() { playerPos.y -= 5 }
    keyHandlers[Keyboard.DOWN_ARROW]  =
    keyHandlers[Keyboard.KEY_S]       = function() { playerPos.y += 5 }
    
    return {
      tickInterval: 30, // ms/frame
      tileSize: 32,
      numCols: 24,      // in # of tiles; must be a multiple of 2
      numRows: 16,      // in # of tiles; must be a multiple of 2

      imagePath: "images",
      
      spriteNames: ["grass", "snow", "water", "player"],
      
      init: function(callback) {
        var self = this;

        self.width = self.tileSize * self.numCols;
        self.height = self.tileSize * self.numRows;

        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        canvas.width = self.width;
        canvas.height = self.height;
        document.body.appendChild(canvas);
        
        self._initKeyboard();
        
        // Initialize the player position
        playerPos.x = Math.floor(self.width / 2);
        playerPos.y = Math.floor(self.height / 2);
        
        // Cache all the images so that we are not loading them while the user
        // plays the game
        self._preloadImages();
      },
      
      ready: function(callback) {
        var self = this;
        // Poll until all the images have been loaded
        var timer = setInterval(function() {
          if (ready) {
            clearInterval(timer);
            callback();
          }
        }, 100);
      },

      run: function() {
        var self = this;
        // Cache the background layer
        self._initBackground();
        // Start the game loop
        setInterval(function() { self._redraw() }, self.tickInterval);
      },

      _preloadImages: function() {
        var self = this;
        for (var i=0; i<self.spriteNames.length; i++) {
          (function(i) {
            var name = self.spriteNames[i];
            var image = new Image(self.tileSize, self.tileSize);
            image.src = self.imagePath + "/" + name + ".gif";
            image.onload = function() {
              if (i == self.spriteNames.length-1) ready = true;
            }
            images[name] = image;
          })(i)
        }
      },

      _redraw: function() {
        var self = this;
        
        // Draw the background
        ctx.drawImage(background, 0, 0);
        
        // Draw the player
        ctx.drawImage(images["player"], playerPos.x, playerPos.y);
        
        // Respond to keystrokes placed during the "dead time", i.e., the time
        // between the end of last iteration and the start of this iteration
        for (key in activeKeyHandlers) {
          activeKeyHandlers[key]();
          //delete activeKeyHandlers[key];
        }
      },
      
      _initKeyboard: function() {
        bean.add(document, 'keydown', function(event) {
          var key = event.keyCode;
          if (key in keyHandlers) {
            if (!(key in activeKeyHandlers)) activeKeyHandlers[key] = keyHandlers[key];
            event.preventDefault();
          }
        });
        
        bean.add(document, 'keyup', function(event) {
          var key = event.keyCode;
          delete activeKeyHandlers[key];
          event.preventDefault();
        })
      },
      
      // One of the things we need to during our game loop is redraw the
      // background. Unfortunately, this is not optimal because since our
      // background is made up of tiles, it means we will need to call
      // drawImage() numRows * numCols times, *for every iteration*. Yikes!
      // We can fix this by taking advantage of the fact that Canvas lets
      // save a canvas object as a PNG. So basically, we concatenate the
      // background into one PNG and then redraw *that* every iteration.
      //
      _initBackground: function() {
        var self = this;
        
        var localCanvas = document.createElement("canvas");
        var localCtx = localCanvas.getContext("2d");
        localCanvas.width = canvas.width;
        localCanvas.height = canvas.height;
        
        var bgSpriteNames = _.reject(self.spriteNames, function(n) { return n == "player" });
        for (var i=0; i<self.numCols; i++) {
          for (var j=0; j<self.numRows; j++) {
            // Pick a random sprite for the background
            var spriteName = bgSpriteNames[Math.randomInt(0, bgSpriteNames.length-1)];
            localCtx.drawImage(images[spriteName], i*self.tileSize, j*self.tileSize);
          }
        }
        
        background = localCanvas;
      }
    }
  })();

  $(function() {
    Game.init();
    Game.ready(function() { Game.run() });
    
    /*
    var textarea = document.createElement("textarea");
    textarea.style.width = "300px";
    textarea.style.height = "300px";
    document.body.appendChild(textarea);
    var key;
    bean.add(textarea, 'keydown', function(event) {
      if (!key) key = event.keyCode;
      else event.preventDefault();
    })
    */
  })
  
})(window, window.document, window.$, window._);