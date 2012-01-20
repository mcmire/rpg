(function() {
  var g, intervalTicker, ticker,
    __slice = Array.prototype.slice;

  g = window.game || (window.game = {});

  ticker = {
    construct: function() {
      var args, name, overrides, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = args.reverse(), overrides = _ref[0], name = _ref[1];
      overrides || (overrides = {});
      name || (name = 'game.ticker');
      return g.module(name, g.runnable, g.tickable, {
        init: function(main) {
          this.main = main;
        },
        destroy: function() {
          if (this.isInit) return this.stop();
        },
        start: function() {
          var _ref2;
          if (this.isRunning) return;
          this.isRunning = true;
          if ((_ref2 = overrides.start) != null) _ref2.call(this);
          return this;
        },
        stop: function() {
          var _ref2;
          if (!this.isRunning) return;
          this.isRunning = false;
          if ((_ref2 = overrides.stop) != null) _ref2.call(this);
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
      var args, methods, name, overrides, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = args.reverse(), overrides = _ref[0], name = _ref[1];
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
      g.meta.extend(methods, overrides);
      return ticker.construct(name, methods);
    }
  };

  g.ticker = ticker;

  g.intervalTicker = intervalTicker;

}).call(this);
