
define(function(require) {
  var Enemy, Player, collisionLayer, core, plug, ticker, viewport;
  ticker = require('app/ticker').ticker;
  plug = require('app/plug');
  viewport = require('app/viewport');
  collisionLayer = require('app/collision_layer');
  Player = require('app/player');
  Enemy = require('app/enemy');
  core = ticker.construct('game.core', plug(viewport, collisionLayer, Player, Enemy), {
    frameRate: 40,
    imagesPath: '/images',
    animMethod: 'setTimeout',
    map: {
      width: 2560,
      height: 1600
    },
    init: function(main) {
      var self;
      this.main = main;
      self = this;
      this.keyboard = this.main.keyboard;
      this._super(this.main);
      this.tickInterval = 1000 / this.frameRate;
      return this.throttledDraw = this.createIntervalTimer(this.tickInterval, function(df, dt) {
        return self.draw(df, dt);
      });
    },
    reset: function() {
      this._super();
      this.numDraws = 0;
      this.lastTickTime = null;
      return this.numTicks = 0;
    },
    start: function() {
      return this.tick();
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
      this.plugins.tickable.run('tick');
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
    }
  });
  return core;
});
