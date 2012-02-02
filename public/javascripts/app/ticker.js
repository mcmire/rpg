
define(function(require) {
  var intervalTicker, meta, runnable, tickable, ticker, _ref;
  meta = require('app/meta2');
  _ref = require('app/roles'), runnable = _ref.runnable, tickable = _ref.tickable;
  ticker = meta.def('game.ticker', runnable, tickable, {
    isRunning: false,
    extend: function(mixin, opts) {
      if (opts == null) opts = {};
      opts = $.v.extend({}, opts, {
        start: '_start',
        stop: '_stop'
      });
      return this._super(mixin, opts);
    },
    destroy: function() {
      return this.stop();
    },
    assignTo: function(parent) {
      this.parent = parent;
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
  intervalTicker = ticker.cloneAs('game.intervalTicker').extend({
    init: function() {
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
  return {
    ticker: ticker,
    intervalTicker: intervalTicker
  };
});
