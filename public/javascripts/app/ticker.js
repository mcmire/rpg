var __slice = Array.prototype.slice;

define(function(require) {
  var intervalTicker, meta, module, runnable, tickable, ticker, _ref, _ref2;
  meta = (_ref = require('app/meta'), module = _ref.module, _ref);
  _ref2 = require('app/roles'), runnable = _ref2.runnable, tickable = _ref2.tickable;
  ticker = {
    construct: function() {
      var mixins, mod, name;
      mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof mixins[0] === 'string') name = mixins.shift();
      name || (name = 'game.ticker');
      mod = module(name, runnable, tickable, {
        init: function(main) {
          this.main = main;
        },
        destroy: function() {
          if (this.isInit) return this.stop();
        },
        start: function() {
          if (this.isRunning) return;
          this.isRunning = true;
          this._start();
          return this;
        },
        _start: function() {},
        stop: function() {
          if (!this.isRunning) return;
          this.isRunning = false;
          this._stop();
          return this;
        },
        _stop: function() {},
        suspend: function() {
          this.wasRunning = this.isRunning;
          return this.stop();
        },
        resume: function() {
          if (this.wasRunning) return this.start();
        }
      });
      mod.addTranslations({
        start: '_start',
        stop: '_stop'
      });
      mod.extend.apply(mod, mixins);
      return mod;
    }
  };
  intervalTicker = {
    construct: function() {
      var mixins, mod, name;
      mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof mixins[0] === 'string') name = mixins.shift();
      name || (name = 'game.intervalTicker');
      mod = ticker.construct(name, {
        init: function(main) {
          var self;
          self = this;
          this._super(main);
          return this.drawer = this.createIntervalTimer(false, function(df, dt) {
            return self.draw(df, dt);
          });
        },
        start: function() {
          return this.timer = window.setInterval(this.drawer, this.tickInterval);
        },
        stop: function() {
          if (this.timer) {
            window.clearInterval(this.timer);
            return this.timer = null;
          }
        },
        draw: function() {
          throw new Error('draw must be overridden');
        }
      });
      mod.extend.apply(mod, mixins);
      return mod;
    }
  };
  return {
    ticker: ticker,
    intervalTicker: intervalTicker
  };
});
