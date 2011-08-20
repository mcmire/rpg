(function() {
  var config, game, _dim;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  game = window.game;
  _dim = function(value, unit) {
    var d;
    d = {};
    switch (unit) {
      case "tile":
      case "tiles":
        d.tiles = value;
        d.pixels = value * self.tileSize;
        break;
      case "pixel":
      case "pixels":
        d.pixels = value;
        d.tiles = value / self.tileSize;
    }
    return d;
  };
  config = {};
  config.drawInterval = 30;
  config.tileSize = 32;
  config.playerPadding = 30;
  config.playerSpeed = 10;
  config.imagePath = "images";
  config.imagesLoaded = false;
  config.mapLoaded = false;
  config.viewportWidth = _dim(24, 'tiles');
  config.viewportHeight = _dim(16, 'tiles');
  config.mapWidth = _dim(1280, 'pixels');
  config.mapHeight = _dim(800, 'pixels');
  game.util.module("game.Engine", {
    config: config,
    init: function() {
      if (!this.isInit) {
        this.reset();
        this.canvas = Canvas.create(this.viewport.width.pixels, this.viewport.height.pixels);
        this.player = Player.init(this);
        this._preloadMap();
        this._preloadSprites();
        this.isInit = true;
      }
      return this;
    },
    destroy: function() {
      if (this.isInit) {
        this.removeEvents();
        this.reset();
        this.isInit = false;
      }
      return this;
    },
    reset: function() {
      this.data = [];
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
          fenceDistance: null,
          width: this.viewportWidth,
          height: this.viewportHeight
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
      return this;
    },
    removeEvents: function() {
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
    run: function() {},
    _preloadMap: function() {},
    _renderMap: function() {}
  });
}).call(this);
