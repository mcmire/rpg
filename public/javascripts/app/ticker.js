var __slice = Array.prototype.slice;

define(function(require) {
  var intervalTicker, meta, module, runnable, tickable, ticker, _ref, _ref2;
  meta = (_ref = require('app/meta'), module = _ref.module, _ref);
  _ref2 = require('app/roles'), runnable = _ref2.runnable, tickable = _ref2.tickable;
  ticker = {
    construct: function() {
      var args, name, overrides, _ref3;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref3 = args.reverse(), overrides = _ref3[0], name = _ref3[1];
      overrides || (overrides = {});
      name || (name = 'game.ticker');
      return module(name, runnable, tickable, {
        init: function(main) {
          this.main = main;
        },
        destroy: function() {
          if (this.isInit) return this.stop();
        },
        start: function() {
          var _ref4;
          if (this.isRunning) return;
          this.isRunning = true;
          if ((_ref4 = overrides.start) != null) _ref4.call(this);
          return this;
        },
        stop: function() {
          var _ref4;
          if (!this.isRunning) return;
          this.isRunning = false;
          if ((_ref4 = overrides.stop) != null) _ref4.call(this);
          return this;
        },
        suspend: function() {
          this.wasRunning = this.isRunning;
          return this.stop();
        },
        resume: function() {
          if (this.wasRunning) return this.start();
        }
      });
    }
  };
  intervalTicker = {
    construct: function() {
      var args, methods, name, overrides, _ref3;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref3 = args.reverse(), overrides = _ref3[0], name = _ref3[1];
      overrides || (overrides = {});
      name || (name = 'game.intervalTicker');
      methods = {
        init: function(main) {
          this._super(main);
          return this.tickFunction = this.tick;
        },
        start: function() {
          return this.timer = window.setInterval(this.tickFunction, this.tickInterval);
        },
        stop: function() {
          if (this.timer) {
            window.clearInterval(this.timer);
            return this.timer = null;
          }
        }
      };
      meta.extend(methods, overrides);
      return ticker.construct(name, methods);
    }
  };
  return {
    ticker: ticker
  };
  return {
    intervalTicker: intervalTicker
  };
});
