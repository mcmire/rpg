(function() {
  var Canvas, Keyboard, defaults, game, _dim;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  game = window.game;
  Keyboard = game.Keyboard, Canvas = game.Canvas;
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
  defaults.viewportWidth = _dim(24, 'tiles');
  defaults.viewportHeight = _dim(16, 'tiles');
  defaults.mapWidth = _dim(1280, 'pixels');
  defaults.mapHeight = _dim(800, 'pixels');
  game.util.module("game.Main", [defaults], {
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
        names: ["player"],
        instances: {}
      };
      return this;
    },
    addEvents: function() {
      Keyboard.addEvents();
      return this;
    },
    removeEvents: function() {
      Keyboard.removeEvents();
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
        console.log("Checking to see if map/sprites loaded...");
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
      return this.canvas.ctx.drawImage(this.sprite.instances['player'], this.player.viewport.pos.x, this.player.viewport.pos.y);
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
    _assignKeyHandlers: function() {
      var self;
      self = this;
      Keyboard.addKeyHandler(function() {
        self._debugViewport();
        return self._debugPlayer();
      });
      Keyboard.addKeyHandler('KEY_A', 'KEY_LEFT', function() {
        if ((self.viewport.bounds.x1 - self.player.speed) >= 0) {
          if ((self.player.viewport.pos.x - self.player.speed) >= self.viewport.playerPadding) {
            self.player.viewport.pos.x -= self.player.speed;
            self.player.viewport.offset.x -= self.player.speed;
          } else {
            self.viewport.bounds.x1 -= self.player.speed;
            self.viewport.bounds.x2 -= self.player.speed;
          }
          return self.player.map.pos.x -= self.player.speed;
        } else if ((self.player.viewport.pos.x - self.player.speed) >= 0) {
          self.player.viewport.pos.x -= self.player.speed;
          self.player.viewport.offset.x -= self.player.speed;
          return self.player.map.pos.x -= self.player.speed;
        } else {
          self.player.viewport.pos.x -= self.player.viewport.pos.x;
          self.player.viewport.offset.x -= self.player.viewport.pos.x;
          return self.player.map.pos.x -= self.player.viewport.pos.x;
        }
      });
      Keyboard.addKeyHandler('KEY_D', 'KEY_RIGHT', function() {
        var dist;
        if ((self.viewport.bounds.x2 + self.player.speed) <= self.map.width.pixels) {
          if ((self.viewport.width.pixels - (self.player.viewport.pos.x + self.tileSize + self.player.speed)) >= self.viewport.playerPadding) {
            self.player.viewport.pos.x += self.player.speed;
            self.player.viewport.offset.x += self.player.speed;
          } else {
            self.viewport.bounds.x1 += self.player.speed;
            self.viewport.bounds.x2 += self.player.speed;
          }
          return self.player.map.pos.x += self.player.speed;
        } else {
          dist = (self.player.viewport.pos.x + self.tileSize) - self.viewport.width.pixels;
          if ((dist + self.player.speed) < 0) {
            self.player.viewport.pos.x += self.player.speed;
            self.player.viewport.offset.x += self.player.speed;
            return self.player.map.pos.x += self.player.speed;
          } else {
            self.player.viewport.pos.x += -dist;
            self.player.viewport.offset.x += -dist;
            return self.player.map.pos.x += -dist;
          }
        }
      });
      Keyboard.addKeyHandler('KEY_W', 'KEY_UP', function() {
        if ((self.viewport.bounds.y1 - self.player.speed) >= 0) {
          if ((self.player.viewport.pos.y - self.player.speed) >= self.viewport.playerPadding) {
            self.player.viewport.pos.y -= self.player.speed;
            self.player.viewport.offset.y -= self.player.speed;
          } else {
            self.viewport.bounds.y1 -= self.player.speed;
            self.viewport.bounds.y2 -= self.player.speed;
          }
          return self.player.map.pos.y -= self.player.speed;
        } else if ((self.player.viewport.pos.y - self.player.speed) >= 0) {
          self.player.viewport.pos.y -= self.player.speed;
          self.player.viewport.offset.y -= self.player.speed;
          return self.player.map.pos.y -= self.player.speed;
        } else {
          self.player.viewport.pos.y -= self.player.viewport.pos.y;
          self.player.viewport.offset.y -= self.player.viewport.pos.y;
          return self.player.map.pos.y -= self.player.viewport.pos.y;
        }
      });
      return Keyboard.addKeyHandler('KEY_S', 'KEY_DOWN', function() {
        var dist;
        if ((self.viewport.bounds.y2 + self.player.speed) <= self.map.height.pixels) {
          if ((self.viewport.height.pixels - (self.player.viewport.pos.y + self.tileSize + self.player.speed)) >= self.viewport.playerPadding) {
            self.player.viewport.pos.y += self.player.speed;
            self.player.viewport.offset.y += self.player.speed;
          } else {
            self.viewport.bounds.y1 += self.player.speed;
            self.viewport.bounds.y2 += self.player.speed;
          }
          return self.player.map.pos.y += self.player.speed;
        } else {
          dist = (self.player.viewport.pos.y + self.tileSize) - self.viewport.height.pixels;
          if ((dist + self.player.speed) < 0) {
            self.player.viewport.pos.y += self.player.speed;
            self.player.viewport.offset.y += self.player.speed;
            return self.player.map.pos.y += self.player.speed;
          } else {
            self.player.viewport.pos.y += -dist;
            self.player.viewport.offset.y += -dist;
            return self.player.map.pos.y += -dist;
          }
        }
      });
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
        image = new Image(this.tileSize, this.tileSize);
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
      this.player.viewport.pos.x = this.viewport.width.pixels / 2;
      this.player.viewport.pos.y = this.viewport.height.pixels / 2;
      return this.player.viewport.fenceDistance = (this.viewport.width.pixels / 2) - this.viewport.playerPadding;
    },
    _renderMap: function() {
      return this.viewport.$element.css('background-image', "url(" + this.imagesPath + "/map.png)");
    },
    _initViewportBounds: function() {},
    _initPlayerOnMap: function() {
      this.player.map.pos.x = this.viewport.bounds.x1 + (this.viewport.width.pixels / 2);
      return this.player.map.pos.y = this.viewport.bounds.y1 + (this.viewport.height.pixels / 2);
    },
    _debugViewport: function() {
      return console.log("@viewport.bounds = (" + this.viewport.bounds.x1 + ".." + this.viewport.bounds.x2 + ", " + this.viewport.bounds.y1 + ".." + this.viewport.bounds.y2 + ")");
    },
    _debugPlayer: function() {
      return console.log("@player.viewport.pos = (" + this.player.viewport.pos.x + ", " + this.player.viewport.pos.y + ")");
    }
  });
}).call(this);
