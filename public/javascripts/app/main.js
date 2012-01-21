
define(function(require) {
  var Class, Enemy, Player, collisionLayer, core, eventable, keyboard, loadable, main, module, plug, runnable, tickable, viewport, _ref, _ref2;
  _ref = require('app/meta'), Class = _ref.Class, module = _ref.module;
  _ref2 = require('app/roles'), eventable = _ref2.eventable, loadable = _ref2.loadable, tickable = _ref2.tickable, runnable = _ref2.runnable;
  plug = require('app/plug');
  keyboard = require('app/keyboard');
  viewport = require('app/viewport');
  core = require('app/core');
  collisionLayer = require('app/collision_layer').collisionLayer;
  Player = require('app/Player');
  Enemy = require('app/Enemy');
  main = module('game.main', eventable, loadable, tickable, runnable, plug(keyboard, viewport, core, collisionLayer, Player, Enemy), {
    frameRate: 40,
    imagesPath: '/images',
    animMethod: 'setTimeout',
    debug: false,
    map: {
      width: 2560,
      height: 1600
    },
    init: function() {
      this._super();
      this.addEvents();
      this.attachTo(document.body);
      return this.run();
    },
    addEvents: function() {
      this._super();
      return this.bindEvents(window, {
        blur: function() {
          return self.suspend();
        },
        focus: function() {
          return self.resume();
        }
      });
    },
    removeEvents: function() {
      this._super();
      return this.unbindEvents(window, 'blur', 'focus');
    },
    reset: function() {
      this._super();
      if (this.isInit) return this.stop();
    },
    load: function(callback) {
      var i, self, ticker;
      self = this;
      i = 0;
      this._super();
      return ticker = window.setInterval((function() {
        i++;
        if (i === 20) {
          window.clearInterval(ticker);
          ticker = null;
          throw new Error("Grobs haven't been loaded yet?!");
          return;
        }
        console.log("Checking to see if all grobs are loaded...");
        if (this.isLoaded()) {
          window.clearInterval(ticker);
          ticker = null;
          return callback();
        }
      }), 100);
    },
    run: function() {
      main.load(function() {
        return main.start();
      });
      return this;
    },
    createIntervalTimer: function(arg, fn) {
      var always, f0, interval, t0;
      if (arg === true) {
        always = true;
      } else {
        interval = arg;
      }
      t0 = (new Date()).getTime();
      f0 = this.core.numDraws;
      return function() {
        var df, dt, t;
        t = (new Date()).getTime();
        dt = t - t0;
        df = this.core.numDraws - f0;
        if (always || dt >= interval) {
          fn(df, dt);
          t0 = (new Date()).getTime();
          return f0 = this.core.numDraws;
        }
      };
    }
  });
  return main;
});
