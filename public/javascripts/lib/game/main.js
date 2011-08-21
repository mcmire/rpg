(function() {
  var Canvas, DOMEventHelpers, Keyboard, defaults, game, _dim;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  game = window.game;
  Keyboard = game.Keyboard, DOMEventHelpers = game.DOMEventHelpers, Canvas = game.Canvas;
  defaults = {};
  _dim = function(value, unit) {
    var d;
    d = {};
    switch (unit) {
      case "tile":
      case "tiles":
        d.tiles = value;
        d.pixels = value * defaults.tileSize;
        break;
      case "pixel":
      case "pixels":
        d.pixels = value;
        d.tiles = value / defaults.tileSize;
    }
    return d;
  };
  defaults.drawInterval = 30;
  defaults.tileSize = 32;
  defaults.playerPadding = 30;
  defaults.playerSpeed = 10;
  defaults.imagesPath = "images";
  defaults.mapLoaded = false;
  defaults.numSpritesLoaded = 0;
  defaults.spritesLoaded = false;
  defaults.mapWidth = _dim(1280, 'pixels');
  defaults.mapHeight = _dim(800, 'pixels');
  defaults.viewportWidth = _dim(600, 'pixels');
  defaults.viewportHeight = _dim(400, 'pixels');
  game.util.module("game.Main", [DOMEventHelpers, defaults], {
    init: function() {
      if (!this.isInit) {
        this.reset();
        Keyboard.init();
        this._assignKeyHandlers();
        this._initViewport();
        this.viewport.$element = $('<div id="viewport" />').css('width', this.viewport.width.pixels).css('height', this.viewport.height.pixels);
        this.canvas = Canvas.create(this.viewport.width.pixels, this.viewport.height.pixels);
        this.viewport.$element.append(this.canvas.$element);
        this._preloadMap();
        this._preloadSprites();
        this._initPlayerWithinViewport();
        this.isInit = true;
      }
      return this;
    },
    destroy: function() {
      if (this.isInit) {
        this.removeEvents();
        this.detach();
        Keyboard.destroy();
        this.stopDrawing();
        this.reset();
        this.isInit = false;
      }
      return this;
    },
    reset: function() {
      this.isDrawing = false;
      this.data = [];
      this.viewport = {
        width: null,
        height: null,
        bounds: {
          x1: 0,
          x2: 0,
          y1: 0,
          y2: 0
        },
        playerPadding: this.playerPadding
      };
      this.map = {
        width: null,
        height: null,
        data: []
      };
      this.bg = {
        offset: {
          x: 0,
          y: 0
        }
      };
      this.player = {
        viewport: {
          pos: {
            x: 0,
            y: 0
          },
          offset: {
            x: 0,
            y: 0
          },
          fenceDistance: null
        },
        map: {
          pos: {
            x: 0,
            y: 0
          },
          width: this.mapWidth,
          height: this.mapHeight
        },
        speed: this.playerSpeed
      };
      this.sprite = {
        names: ["link"],
        instances: {}
      };
      return this;
    },
    addEvents: function() {
      var self;
      self = this;
      Keyboard.addEvents();
      this.bindEvents(window, {
        blur: function() {
          return self.suspend();
        },
        focus: function() {
          return self.resume();
        }
      });
      return this;
    },
    removeEvents: function() {
      Keyboard.removeEvents();
      this.unbindEvents(window, 'blur', 'focus');
      return this;
    },
    attachTo: function(wrapper) {
      $(wrapper).append(this.viewport.$element);
      return this;
    },
    detach: function() {
      this.canvas.$element.detach();
      return this;
    },
    ready: function(callback) {
      var timer;
      return timer = setInterval(__bind(function() {
        if (this.mapLoaded && this.spritesLoaded) {
          clearInterval(timer);
          return callback();
        }
      }, this), 100);
    },
    run: function() {
      this._renderMap();
      this._initViewportBounds();
      this._initPlayerOnMap();
      this._debugViewport();
      this._debugPlayer();
      return this.startDrawing();
    },
    startDrawing: function() {
      if (!this.isDrawing) {
        this.isDrawing = true;
        this._keepDrawing();
      }
      return this;
    },
    stopDrawing: function() {
      this.isDrawing = false;
      return this;
    },
    draw: function() {
      Keyboard.runHandlers();
      this.viewport.$element.css('background-position', [-this.viewport.bounds.x1 + 'px', -this.viewport.bounds.y1 + 'px'].join(" "));
      this.canvas.ctx.clearRect(0, 0, this.viewport.width.pixels, this.viewport.height.pixels);
      return this.canvas.ctx.drawImage(this.sprite.instances['link'], 0, 0, 17, 24, this.player.viewport.pos.x, this.player.viewport.pos.y, 17, 24);
    },
    _keepDrawing: function() {
      var self;
      self = this;
      this.draw();
      if (this.isDrawing) {
        return setTimeout((function() {
          return self._keepDrawing();
        }), this.drawInterval);
      }
    },
    suspend: function() {
      if (!this.stateBeforeSuspend) {
        this.stateBeforeSuspend = {
          wasDrawing: !!this.isDrawing
        };
        return this.stopDrawing();
      }
    },
    resume: function() {
      if (this.stateBeforeSuspend) {
        if (this.stateBeforeSuspend.wasDrawing) {
          this.startDrawing();
        }
        return this.stateBeforeSuspend = null;
      }
    },
    _assignKeyHandlers: function() {
      var self;
      self = this;
      Keyboard.addKeyHandler(function() {
        self._debugViewport();
        return self._debugPlayer();
      });
      Keyboard.addKeyHandler('KEY_A', 'KEY_LEFT', 'KEY_H', function() {
        return self._movePlayerLeft();
      });
      Keyboard.addKeyHandler('KEY_D', 'KEY_RIGHT', 'KEY_L', function() {
        return self._movePlayerRight();
      });
      Keyboard.addKeyHandler('KEY_W', 'KEY_UP', 'KEY_K', function() {
        return self._movePlayerUp();
      });
      return Keyboard.addKeyHandler('KEY_S', 'KEY_DOWN', 'KEY_J', function() {
        return self._movePlayerDown();
      });
    },
    _movePlayerLeft: function() {
      if ((this.viewport.bounds.x1 - this.player.speed) >= 0) {
        if ((this.player.viewport.pos.x - this.player.speed) >= this.viewport.playerPadding) {
          this.player.viewport.pos.x -= this.player.speed;
          this.player.viewport.offset.x -= this.player.speed;
        } else {
          this.viewport.bounds.x1 -= this.player.speed;
          this.viewport.bounds.x2 -= this.player.speed;
        }
        return this.player.map.pos.x -= this.player.speed;
      } else if ((this.player.viewport.pos.x - this.player.speed) >= 0) {
        this.player.viewport.pos.x -= this.player.speed;
        this.player.viewport.offset.x -= this.player.speed;
        return this.player.map.pos.x -= this.player.speed;
      } else {
        this.player.viewport.pos.x -= this.player.viewport.pos.x;
        this.player.viewport.offset.x -= this.player.viewport.pos.x;
        return this.player.map.pos.x -= this.player.viewport.pos.x;
      }
    },
    _movePlayerRight: function() {
      var dist;
      if ((this.viewport.bounds.x2 + this.player.speed) <= this.map.width.pixels) {
        if ((this.viewport.width.pixels - (this.player.viewport.pos.x + this.tileSize + this.player.speed)) >= this.viewport.playerPadding) {
          this.player.viewport.pos.x += this.player.speed;
          this.player.viewport.offset.x += this.player.speed;
        } else {
          this.viewport.bounds.x1 += this.player.speed;
          this.viewport.bounds.x2 += this.player.speed;
        }
        return this.player.map.pos.x += this.player.speed;
      } else {
        dist = (this.player.viewport.pos.x + this.tileSize) - this.viewport.width.pixels;
        if ((dist + this.player.speed) < 0) {
          this.player.viewport.pos.x += this.player.speed;
          this.player.viewport.offset.x += this.player.speed;
          return this.player.map.pos.x += this.player.speed;
        } else {
          this.player.viewport.pos.x += -dist;
          this.player.viewport.offset.x += -dist;
          return this.player.map.pos.x += -dist;
        }
      }
    },
    _movePlayerUp: function() {
      if ((this.viewport.bounds.y1 - this.player.speed) >= 0) {
        if ((this.player.viewport.pos.y - this.player.speed) >= this.viewport.playerPadding) {
          this.player.viewport.pos.y -= this.player.speed;
          this.player.viewport.offset.y -= this.player.speed;
        } else {
          this.viewport.bounds.y1 -= this.player.speed;
          this.viewport.bounds.y2 -= this.player.speed;
        }
        return this.player.map.pos.y -= this.player.speed;
      } else if ((this.player.viewport.pos.y - this.player.speed) >= 0) {
        this.player.viewport.pos.y -= this.player.speed;
        this.player.viewport.offset.y -= this.player.speed;
        return this.player.map.pos.y -= this.player.speed;
      } else {
        this.player.viewport.pos.y -= this.player.viewport.pos.y;
        this.player.viewport.offset.y -= this.player.viewport.pos.y;
        return this.player.map.pos.y -= this.player.viewport.pos.y;
      }
    },
    _movePlayerDown: function() {
      var dist;
      if ((this.viewport.bounds.y2 + this.player.speed) <= this.map.height.pixels) {
        if ((this.viewport.height.pixels - (this.player.viewport.pos.y + this.tileSize + this.player.speed)) >= this.viewport.playerPadding) {
          this.player.viewport.pos.y += this.player.speed;
          this.player.viewport.offset.y += this.player.speed;
        } else {
          this.viewport.bounds.y1 += this.player.speed;
          this.viewport.bounds.y2 += this.player.speed;
        }
        return this.player.map.pos.y += this.player.speed;
      } else {
        dist = (this.player.viewport.pos.y + this.tileSize) - this.viewport.height.pixels;
        if ((dist + this.player.speed) < 0) {
          this.player.viewport.pos.y += this.player.speed;
          this.player.viewport.offset.y += this.player.speed;
          return this.player.map.pos.y += this.player.speed;
        } else {
          this.player.viewport.pos.y += -dist;
          this.player.viewport.offset.y += -dist;
          return this.player.map.pos.y += -dist;
        }
      }
    },
    _initViewport: function() {
      this.viewport.width = this.viewportWidth;
      return this.viewport.height = this.viewportHeight;
    },
    _preloadMap: function() {
      this.map.width = this.mapWidth;
      this.map.height = this.mapHeight;
      return this.mapLoaded = true;
    },
    _preloadSprites: function() {
      var i, image, len, name, _ref, _results;
      _ref = [0, this.sprite.names.length], i = _ref[0], len = _ref[1];
      if (len === 0) {
        this.spritesLoaded = true;
        return;
      }
      _results = [];
      while (i < len) {
        name = this.sprite.names[i];
        image = new Image();
        image.src = "" + this.imagesPath + "/" + name + ".gif";
        image.onload = __bind(function() {
          this.numSpritesLoaded++;
          if (this.numSpritesLoaded === len) {
            return this.spritesLoaded = true;
          }
        }, this);
        this.sprite.instances[name] = image;
        _results.push(i++);
      }
      return _results;
    },
    _initPlayerWithinViewport: function() {
      this.player.viewport.pos.x = 0;
      this.player.viewport.pos.y = 0;
      return this.player.viewport.fenceDistance = (this.viewport.width.pixels / 2) - this.viewport.playerPadding;
    },
    _renderMap: function() {
      this.viewport.$element.css('background-image', "url(" + this.imagesPath + "/map.png)");
      return this.viewport.$element.css('background-repeat', 'no-repeat');
    },
    _initViewportBounds: function() {
      this.viewport.bounds.x1 = 0;
      this.viewport.bounds.x2 = this.viewport.width.pixels;
      this.viewport.bounds.y1 = 0;
      return this.viewport.bounds.y2 = this.viewport.height.pixels;
    },
    _initPlayerOnMap: function() {
      this.player.map.pos.x = this.viewport.bounds.x1 + this.player.viewport.pos.x;
      return this.player.map.pos.y = this.viewport.bounds.y1 + this.player.viewport.pos.y;
    },
    _debugViewport: function() {
      return console.log("@viewport.bounds = (" + this.viewport.bounds.x1 + ".." + this.viewport.bounds.x2 + ", " + this.viewport.bounds.y1 + ".." + this.viewport.bounds.y2 + ")");
    },
    _debugPlayer: function() {
      return console.log("@player.viewport.pos = (" + this.player.viewport.pos.x + ", " + this.player.viewport.pos.y + ")");
    }
  });
}).call(this);
