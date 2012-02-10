(function() {
  var attachable, core, game, tickable, ticker, _ref;

  game = (window.game || (window.game = {}));

  ticker = game.ticker.ticker;

  _ref = game.roles, attachable = _ref.attachable, tickable = _ref.tickable;

  core = ticker.cloneAs('game.core');

  core.extend(attachable, tickable, {
    frameRate: 40,
    animMethod: 'setTimeout',
    init: function(main) {
      var self;
      this.main = main;
      this._super(this.main);
      self = this;
      this.player = game.player.assignTo(this);
      this.keyboard = this.main.keyboard;
      this.viewport = game.viewport.init(this, this.player);
      this.tickInterval = 1000 / this.frameRate;
      this.throttledDraw = this.createIntervalTimer(this.tickInterval, function(df, dt) {
        return self.draw(df, dt);
      });
      this.numDraws = 0;
      this.lastTickTime = null;
      this.numTicks = 0;
      return this;
    },
    setElement: function() {
      return this.$element = this.parentElement;
    },
    attach: function() {
      return this.viewport.attach();
    },
    start: function() {
      if (!this.startedBefore) this.loadMap('lw_52');
      this.tick();
      return this.startedBefore = true;
    },
    stop: function() {
      if (this.timer) {
        if (this.animMethod === 'setTimeout') {
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
      if (core.main.debug) {
        core.msSinceLastDraw = core.lastTickTime ? t - core.lastTickTime : 0;
        console.log("msSinceLastDraw: " + core.msSinceLastDraw);
      }
      if (core.animMethod === 'setTimeout') {
        core.draw();
      } else {
        core.throttledDraw();
      }
      if (core.main.debug) {
        t2 = (new Date()).getTime();
        msDrawTime = t2 - t;
        core.lastTickTime = t;
        console.log("msDrawTime: " + msDrawTime);
      }
      if ((core.numTicks % 100) === 0) core.keyboard.clearStuckKeys(t);
      if (core.animMethod === 'setTimeout') {
        core.timer = window.setTimeout(core.tick, core.tickInterval);
      } else {
        core.timer = window.requestAnimFrame(core.tick, viewport.canvas.element);
      }
      return core.numTicks++;
    },
    draw: function() {
      this.currentMap.tick();
      return this.numDraws++;
    },
    createIntervalTimer: function(arg, fn) {
      var always, f0, interval, t0;
      if (arg === true) {
        always = true;
      } else {
        interval = arg;
      }
      t0 = (new Date()).getTime();
      f0 = this.numDraws;
      return function() {
        var df, dt, t;
        t = (new Date()).getTime();
        dt = t - t0;
        df = this.numDraws - f0;
        if (always || dt >= interval) {
          fn(df, dt);
          t0 = (new Date()).getTime();
          return f0 = this.numDraws;
        }
      };
    },
    loadMap: function(name) {
      var map, self;
      self = this;
      if (map = this.currentMap) {
        map.deactivate();
        map.detachFromViewport();
        map.unload();
        map.removePlayer();
      }
      map = game.mapCollection.get(name);
      map.assignTo(this.viewport);
      map.addPlayer(this.player);
      map.load();
      map.attachToViewport();
      map.activate();
      this.viewport.setMap(map);
      return this.currentMap = map;
    }
  });

  game.core = core;

  window.scriptLoaded('app/core');

}).call(this);
