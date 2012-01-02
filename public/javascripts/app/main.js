(function() {
  var Enemy, EventHelpers, Player, collisionLayer, fpsReporter, game, keyboard, main, ticker, viewport, _ref;

  _ref = game = window.game, keyboard = _ref.keyboard, EventHelpers = _ref.EventHelpers, viewport = _ref.viewport, collisionLayer = _ref.collisionLayer, fpsReporter = _ref.fpsReporter, Player = _ref.Player, Enemy = _ref.Enemy;

  ticker = {};

  ticker.init = function(main) {
    this.main = main;
    this.tickInterval = 1000 / this.main.frameRate;
    this.throttledDrawer = this.main.createIntervalTimer(this.tickInterval, function(df, dt) {
      return ticker.draw();
    });
    return this;
  };

  ticker.start = function() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
    return this;
  };

  ticker.stop = function() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timer) {
      if (this.main.animMethod === 'setTimeout') {
        window.clearTimeout(this.timer);
      } else {
        window.cancelRequestAnimFrame(this.timer);
      }
      this.timer = null;
    }
    return this;
  };

  ticker.suspend = function() {
    this.wasRunning = this.isRunning;
    return this.stop();
  };

  ticker.resume = function() {
    if (this.wasRunning) return this.start();
  };

  ticker.tick = function() {
    var msDrawTime, t, t2;
    if (!ticker.isRunning) return;
    t = (new Date()).getTime();
    if (ticker.main.debug) {
      ticker.msSinceLastDraw = ticker.lastTickTime ? t - ticker.lastTickTime : 0;
      console.log("msSinceLastDraw: " + ticker.msSinceLastDraw);
    }
    if (ticker.main.animMethod === 'setTimeout') {
      ticker.draw();
    } else {
      ticker.throttledDrawer();
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
  };

  ticker.draw = function() {
    var entity, _i, _len, _ref2;
    this.main.viewport.draw();
    _ref2 = this.main.entities;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      entity = _ref2[_i];
      entity.tick();
    }
    return this.main.numDraws++;
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
      this.ticker = ticker.init(this);
      this.timers.push(this.ticker);
      this.fpsReporter = fpsReporter.init(this);
      this.timers.push(this.fpsReporter);
      this.isInit = true;
    }
    return this;
  };

  main._addMobs = function() {
    this.player = new Player(this);
    this.addEntity(this.player, false);
    this.enemy = new Enemy(this);
    return this.addEntity(this.enemy);
  };

  main.addEntity = function(entity, addToCollisionLayer) {
    if (addToCollisionLayer == null) addToCollisionLayer = true;
    this.entities.push(entity);
    if (addToCollisionLayer) this.collisionLayer.add(entity.bounds.onMap);
    return entity.onAdded();
  };

  main.destroy = function() {
    if (this.isInit) {
      this.removeEvents();
      this.detach();
      keyboard.destroy();
      viewport.destroy();
      this.fpsReporter.destroy();
      this.collisionLayer.destroy();
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
    this.fpsReporter.attachTo(viewport.$element);
    this.collisionLayer.attachTo(viewport.$element);
    return this;
  };

  main.detach = function() {
    viewport.detach();
    this.fpsReporter.detach();
    this.collisionLayer.detach();
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

  main._reportingTime = function(name, fn) {
    var ms, t, t2;
    t = (new Date()).getTime();
    fn();
    t2 = (new Date()).getTime();
    ms = t2 - t;
    return console.log("" + name + ": " + ms + " ms");
  };

}).call(this);
