(function() {
  var IntervalTicker, Ticker, game,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  game = window.game;

  Ticker = (function() {

    Ticker.create = function(main, overrides) {
      var ticker;
      ticker = new this(false);
      $.extend(ticker, overrides);
      this.call(ticker, main);
      return ticker;
    };

    function Ticker(main) {
      if (arguments[0] !== false) {
        this.main = main;
        this._init();
      }
    }

    Ticker.prototype._init = function() {};

    Ticker.prototype.destroy = function() {
      this.stop();
      this._destroy();
      return this;
    };

    Ticker.prototype._destroy = function() {};

    Ticker.prototype.start = function() {
      if (this.isRunning) return;
      this.isRunning = true;
      this._start();
      return this;
    };

    Ticker.prototype._start = function() {};

    Ticker.prototype.stop = function() {
      if (!this.isRunning) return;
      this.isRunning = false;
      this._stop();
      return this;
    };

    Ticker.prototype._stop = function() {};

    Ticker.prototype.suspend = function() {
      this.wasRunning = this.isRunning;
      return this.stop();
    };

    Ticker.prototype.resume = function() {
      if (this.wasRunning) return this.start();
    };

    Ticker.prototype.tick = function() {};

    return Ticker;

  })();

  IntervalTicker = (function(_super) {

    __extends(IntervalTicker, _super);

    function IntervalTicker() {
      IntervalTicker.__super__.constructor.apply(this, arguments);
    }

    IntervalTicker.prototype._init = function() {
      return this.tickFunction = this.tick;
    };

    IntervalTicker.prototype._start = function() {
      return this.timer = window.setInterval(this.tickFunction, this.tickInterval);
    };

    IntervalTicker.prototype._stop = function() {
      if (this.timer) {
        window.clearInterval(this.timer);
        return this.timer = null;
      }
    };

    return IntervalTicker;

  })(Ticker);

  game.Ticker = Ticker;

  game.IntervalTicker = IntervalTicker;

}).call(this);
