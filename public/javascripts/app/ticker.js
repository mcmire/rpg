(function() {
  var game, meta, runnable, tickable, ticker, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, runnable = _ref.runnable, tickable = _ref.tickable;

  ticker = meta.def('game.ticker', runnable, tickable, {
    isRunning: false,
    _includeMixin: function(mixin, opts) {
      if (opts == null) opts = {};
      opts = $.v.extend({}, opts, {
        keyTranslations: {
          start: '_start',
          stop: '_stop'
        }
      });
      return this._super(mixin, opts);
    },
    destroy: function() {
      return this.stop();
    },
    run: function() {
      return this.start();
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
    },
    tick: function() {
      throw new Error('You need to override #tick');
    }
  });

  game.ticker = ticker;

  window.scriptLoaded('app/ticker');

}).call(this);
