(function() {
  var Enemy, EventHelpers, IntervalTicker, Player, Ticker, collisionLayer, fpsReporter, game, keyboard, main, mainTicker, playerDebug, viewport, _ref;

  _ref = game = window.game, keyboard = _ref.keyboard, EventHelpers = _ref.EventHelpers, viewport = _ref.viewport, collisionLayer = _ref.collisionLayer, Ticker = _ref.Ticker, IntervalTicker = _ref.IntervalTicker, Player = _ref.Player, Enemy = _ref.Enemy;

  mainTicker = {
    init: function(main) {
      var ticker;
      return ticker = Ticker.create(main, {
        _init: function() {
          var self;
          self = this;
          this.tickInterval = 1000 / this.main.frameRate;
          return this.throttledDraw = this.main.createIntervalTimer(this.tickInterval, function(df, dt) {
            return self.draw();
          });
        },
        _start: function() {
          return this.tick();
        },
        _stop: function() {
          if (this.timer) {
            if (this.main.animMethod === 'setTimeout') {
              window.clearTimeout(this.timer);
            } else {
              window.cancelRequestAnimFrame(this.timer);
            }
            return this.timer = null;
          }
        },
        tick: function() {
          var msDrawTime, t, t2;
          t = (new Date()).getTime();
          if (ticker.main.debug) {
            ticker.msSinceLastDraw = ticker.lastTickTime ? t - ticker.lastTickTime : 0;
            console.log("msSinceLastDraw: " + ticker.msSinceLastDraw);
          }
          if (ticker.main.animMethod === 'setTimeout') {
            ticker.draw();
          } else {
            ticker.throttledDraw();
          }
          if (ticker.main.debug) {
            t2 = (new Date()).getTime();
            msDrawTime = t2 - t;
            ticker.lastTickTime = t;
            console.log("msDrawTime: " + msDrawTime);
          }
          if ((ticker.main.numTicks % 100) === 0) keyboard.clearStuckKeys(t);
          if (ticker.main.animMethod === 'setTimeout') {
            ticker.timer = window.setTimeout(ticker.tick, ticker.tickInterval);
          } else {
            ticker.timer = window.requestAnimFrame(ticker.tick, viewport.canvas.element);
          }
          return ticker.main.numTicks++;
        },
        draw: function() {
          var entity, _i, _len, _ref2;
          this.main.viewport.draw();
          _ref2 = this.main.entities;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            entity = _ref2[_i];
            entity.tick();
          }
          return this.main.numDraws++;
        }
      });
    }
  };

  fpsReporter = {
    init: function(main) {
      var ticker;
      return ticker = IntervalTicker.create(main, {
        _init: function() {
          IntervalTicker.prototype._init.apply(this, arguments);
          this.tickInterval = 1000;
          this.tickFunction = this.main.createIntervalTimer(true, this.draw);
          return this.$div = $('<div id="fps-reporter" />');
        },
        _destroy: function() {
          return this.detach();
        },
        attachTo: function(container) {
          return $(container).append(this.$div);
        },
        detach: function() {
          return this.$div.detach();
        },
        draw: function(df, dt) {
          var fps;
          fps = ((df / dt) * 1000).toFixed(1);
          return ticker.$div.text("" + fps + " FPS");
        }
      });
    }
  };

  playerDebug = {
    init: function(main) {
      var ticker;
      return ticker = IntervalTicker.create(main, {
        _init: function() {
          IntervalTicker.prototype._init.apply(this, arguments);
          this.tickInterval = 1000;
          return this.$div = $('<div style="margin-top: 10px"/>');
        },
        _destroy: function() {
          return this.detach();
        },
        attachTo: function(container) {
          return $(container).append(this.$div);
        },
        detach: function() {
          return this.$div.detach();
        },
        tick: function() {
          /*
                  ticker.$div.html("""
                    <b>Player on map:</b> #{ticker.main.player.bounds.onMap.inspect()}<br>
                    <b>Player in viewport:</b> #{ticker.main.player.bounds.inViewport.inspect()}<br>
                    <b>Viewport:</b> #{ticker.main.viewport.bounds.inspect()}
                  """)
          */
          var enemy, player;
          player = ticker.main.player;
          enemy = ticker.main.enemy;
          return ticker.$div.html("<b>Player on map:</b> " + (player.bounds.onMap.inspect()) + "<br>\n<b>Enemy on map:</b> " + (enemy.bounds.onMap.inspect()) + "<br>\n<b>Player collides:</b> " + (player.collisionLayerBoxes.get(2).intersectsWith(player.bounds.onMap) ? 'yes' : 'no'));
        }
      });
    }
  };

  main = game.util.module("game.main", EventHelpers);

  main.frameRate = 40;

  main.tileSize = 64;

  main.imagesPath = '/images';

  main.animMethod = 'setTimeout';

  main.debug = false;

  main.timers = [];

  main.entities = [];

  main.numDraws = 0;

  main.lastTickTime = null;

  main.numTicks = 0;

  main.init = function() {
    if (!this.isInit) {
      this.reset();
      this.keyboard = keyboard.init();
      this.map = {
        width: this.dim(2560, 'pixels'),
        height: this.dim(1600, 'pixels')
      };
      this.viewport = viewport.init(this);
      this.collisionLayer = collisionLayer.init(this);
      this._addMobs();
      this.mainTicker = mainTicker.init(this);
      this.timers.push(this.mainTicker);
      this.fpsReporter = fpsReporter.init(this);
      this.timers.push(this.fpsReporter);
      this.playerDebug = playerDebug.init(this);
      this.timers.push(this.playerDebug);
      this.isInit = true;
    }
    return this;
  };

  main._addMobs = function() {
    this.player = new Player(this);
    this.addEntity(this.player);
    this.enemy = new Enemy(this);
    return this.addEntity(this.enemy);
  };

  main.addEntity = function(entity, addToCollisionLayer) {
    if (addToCollisionLayer == null) addToCollisionLayer = true;
    this.entities.push(entity);
    if (addToCollisionLayer) this.collisionLayer.add(entity);
    return entity.onAdded();
  };

  main.destroy = function() {
    var timer, _i, _len, _ref2;
    if (this.isInit) {
      this.removeEvents();
      this.detach();
      keyboard.destroy();
      viewport.destroy();
      this.collisionLayer.destroy();
      _ref2 = this.timers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        timer = _ref2[_i];
        timer.destroy();
      }
      this.stop();
      this.reset();
      this.isInit = false;
    }
    return this;
  };

  main.reset = function() {
    this.stop();
    this.logQueue = {};
    this.logQueueMessages = [];
    return this;
  };

  main.addEvents = function() {
    var self;
    self = this;
    keyboard.addEvents();
    this.collisionLayer.addEvents();
    this.bindEvents(window, {
      blur: function() {
        return self.suspend();
      },
      focus: function() {
        return self.resume();
      }
    });
    return this;
  };

  main.removeEvents = function() {
    keyboard.removeEvents();
    this.collisionLayer.removeEvents();
    this.unbindEvents(window, 'blur', 'focus');
    return this;
  };

  main.attachTo = function(element) {
    viewport.attachTo(element);
    this.collisionLayer.attachTo(viewport.$element);
    this.fpsReporter.attachTo(viewport.$element);
    this.playerDebug.attachTo(document.body);
    return this;
  };

  main.detach = function() {
    viewport.detach();
    this.collisionLayer.detach();
    this.fpsReporter.detach();
    this.playerDebug.detach();
    return this;
  };

  main.ready = function(callback) {
    var i, self, timer;
    self = this;
    i = 0;
    return timer = window.setInterval((function() {
      i++;
      if (i === 20) {
        window.clearInterval(timer);
        timer = null;
        throw new Error("Entities haven't been loaded yet?!");
        return;
      }
      console.log("Checking to see if all entities are loaded...");
      if (self.collisionLayer.isLoaded && $.v.every(self.entities, function(entity) {
        return entity.isLoaded;
      })) {
        window.clearInterval(timer);
        timer = null;
        return callback();
      }
    }), 100);
  };

  main.run = function() {
    var timer, _i, _len, _ref2, _results;
    _ref2 = this.timers;
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      timer = _ref2[_i];
      _results.push(timer.start());
    }
    return _results;
  };

  main.runWhenReady = function() {
    main.ready(function() {
      return main.run();
    });
    return this;
  };

  main.stop = function() {
    var timer, _i, _len, _ref2, _results;
    _ref2 = this.timers;
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      timer = _ref2[_i];
      _results.push(timer.stop());
    }
    return _results;
  };

  main.suspend = function() {
    var timer, _i, _len, _ref2, _results;
    _ref2 = this.timers;
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      timer = _ref2[_i];
      _results.push(timer.suspend());
    }
    return _results;
  };

  main.resume = function() {
    var timer, _i, _len, _ref2, _results;
    _ref2 = this.timers;
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      timer = _ref2[_i];
      _results.push(timer.resume());
    }
    return _results;
  };

  main.dim = function(value, unit) {
    var d;
    d = {};
    switch (unit) {
      case "tile":
      case "tiles":
        d.tiles = value;
        d.pixels = value * this.tileSize;
        break;
      case "pixel":
      case "pixels":
        d.pixels = value;
        d.tiles = value / this.tileSize;
    }
    return d;
  };

  main.createIntervalTimer = function(arg, fn) {
    var always, f0, interval, t0;
    if (arg === true) {
      always = true;
    } else {
      interval = arg;
    }
    t0 = (new Date()).getTime();
    f0 = main.numDraws;
    return function() {
      var df, dt, t;
      t = (new Date()).getTime();
      dt = t - t0;
      df = main.numDraws - f0;
      if (always || dt >= interval) {
        fn(df, dt);
        t0 = (new Date()).getTime();
        return f0 = main.numDraws;
      }
    };
  };

  main.mapBoundsToViewportBounds = function(mapBounds) {
    var vb, x1, y1;
    vb = this.viewport.bounds;
    x1 = mapBounds.x1 - vb.x1;
    y1 = mapBounds.y1 - vb.y1;
    return mapBounds.withAnchor(x1, y1);
  };

  main._reportingTime = function(name, fn) {
    var ms, t, t2;
    t = (new Date()).getTime();
    fn();
    t2 = (new Date()).getTime();
    ms = t2 - t;
    return console.log("" + name + ": " + ms + " ms");
  };

}).call(this);
