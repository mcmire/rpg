(function() {
  var Enemy, EventHelpers, FpsReporter, Player, collisionLayer, game, keyboard, main, viewport, _ref;

  _ref = game = window.game, keyboard = _ref.keyboard, EventHelpers = _ref.EventHelpers, viewport = _ref.viewport, collisionLayer = _ref.collisionLayer, FpsReporter = _ref.FpsReporter, Player = _ref.Player, Enemy = _ref.Enemy;

  main = game.util.module("game.main", EventHelpers);

  main.frameRate = 40;

  main.tileSize = 64;

  main.imagesPath = '/images';

  main.animMethod = 'setTimeout';

  main.entities = [];

  main.debug = false;

  main.numDraws = 0;

  main.lastTickTime = null;

  main.numTicks = 0;

  main.tickInterval = 1000 / main.frameRate;

  main.init = function() {
    if (!this.isInit) {
      this.reset();
      this.keyboard = keyboard.init();
      this.map = {
        width: this.dim(2560, 'pixels'),
        height: this.dim(1600, 'pixels')
      };
      this.viewport = viewport.init(this);
      this.fpsReporter = FpsReporter.init(this);
      this.collisionLayer = collisionLayer.init(this);
      this._addMobs();
      this.isInit = true;
    }
    return this;
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
      this.stopTicking();
      this.stopLogging();
      this.reset();
      this.isInit = false;
    }
    return this;
  };

  main.reset = function() {
    this.stopTicking();
    this.stopLogging();
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

  main.suspend = function() {
    if (!this.stateBeforeSuspend) {
      this.stateBeforeSuspend = {
        wasTicking: this.isTicking,
        wasLogging: this.isLogging
      };
      return this.stopTicking();
    }
  };

  main.resume = function() {
    if (this.stateBeforeSuspend) {
      if (this.stateBeforeSuspend.wasTicking) this.startTicking();
      if (this.stateBeforeSuspend.wasLogging) this.startLogging();
      return this.stateBeforeSuspend = null;
    }
  };

  main.runWhenReady = function() {
    main.ready(function() {
      return main.run();
    });
    return this;
  };

  main.run = function() {
    this.startTicking();
    return this.startLogging();
  };

  main.startTicking = function() {
    this.isTicking = true;
    this.tick();
    return this;
  };

  main.stopTicking = function() {
    this.isTicking = false;
    if (this.tickLoopHandle) {
      if (this.animMethod === 'setTimeout') {
        window.clearTimeout(this.tickLoopHandle);
      } else {
        window.cancelRequestAnimFrame(this.tickLoopHandle);
      }
      this.tickLoopHandle = null;
    }
    return this;
  };

  main.tick = function() {
    var msDrawTime, t, t2;
    if (!main.isTicking) return;
    t = (new Date()).getTime();
    if (main.debug) {
      main.msSinceLastDraw = main.lastTickTime ? t - main.lastTickTime : 0;
      console.log("msSinceLastDraw: " + main.msSinceLastDraw);
    }
    if (main.animMethod === 'setTimeout') {
      main.draw();
    } else {
      main._fpsThrottlerTimer();
    }
    if (main.debug) {
      t2 = (new Date()).getTime();
      msDrawTime = t2 - t;
      main.lastTickTime = t;
      console.log("msDrawTime: " + msDrawTime);
    }
    if ((main.numTicks % 100) === 0) keyboard.clearStuckKeys(t);
    if (main.animMethod === 'setTimeout') {
      main.tickLoopHandle = window.setTimeout(main.tick, main.tickInterval);
    } else {
      main.tickLoopHandle = window.requestAnimFrame(main.tick, viewport.canvas.element);
    }
    return main.numTicks++;
  };

  main.draw = function() {
    var entity, _i, _len, _ref2;
    main.viewport.draw();
    _ref2 = this.entities;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      entity = _ref2[_i];
      entity.tick();
    }
    return main.numDraws++;
  };

  main.startLogging = function() {
    this.logLoopHandle = window.setInterval(this._fpsReporterTimer, 1000);
    return this;
  };

  main.stopLogging = function() {
    if (this.logLoopHandle) {
      window.clearInterval(this.logLoopHandle);
      this.logLoopHandle = null;
    }
    return this;
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

  main._addMobs = function() {
    this.player = new Player(this);
    this.addEntity(this.player, false);
    this.enemy = new Enemy(this);
    return this.addEntity(this.enemy);
  };

  main._reportingTime = function(name, fn) {
    var ms, t, t2;
    t = (new Date()).getTime();
    fn();
    t2 = (new Date()).getTime();
    ms = t2 - t;
    return console.log("" + name + ": " + ms + " ms");
  };

  main._createIntervalTimer = function(arg, fn) {
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

  main._fpsThrottlerTimer = main._createIntervalTimer(main.tickInterval, function(df, dt) {
    return main.draw();
  });

  main._fpsReporterTimer = main._createIntervalTimer(true, function(df, dt) {
    return main.fpsReporter.draw(df, dt);
  });

}).call(this);
