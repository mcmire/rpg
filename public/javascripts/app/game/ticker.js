(function() {
  var game;

  (game = this.game).define('ticker', function(name) {
    var ticker;
    ticker = this.meta.def(name, this.roles.runnable, this.roles.tickable, {
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
    return ticker;
  });

}).call(this);
