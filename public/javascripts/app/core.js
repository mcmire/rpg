
define(function(require) {
  var Ticker, core;
  Ticker = require('app/ticker').Ticker;
  core = {
    init: function(main) {
      var ticker;
      ticker = new Ticker(main);
      return ticker.methods({
        init: function(main) {
          var draw;
          this._super(main);
          draw = this.draw;
          this.tickInterval = 1000 / this.main.frameRate;
          return this.throttledDraw = this.main.createIntervalTimer(this.tickInterval, function(df, dt) {
            return draw(df, dt);
          });
        },
        reset: function() {
          this._super();
          this.numDraws = 0;
          this.lastTickTime = null;
          return this.numTicks = 0;
        },
        start: function() {
          return this._super(function(t) {
            return t.tick();
          });
        },
        stop: function() {
          return this._super(function(t) {
            if (t.timer) {
              if (t.main.animMethod === 'setTimeout') {
                window.clearTimeout(t.timer);
              } else {
                window.cancelRequestAnimFrame(t.timer);
              }
              return t.timer = null;
            }
          });
        },
        tick: function() {
          var msDrawTime, t, t2;
          t = (new Date()).getTime();
          if (ticker.main.debug) {
            ticker.msSinceLastDraw = ticker.lastTickTime ? t - ticker.lastTickTime : 0;
            console.log("msSinceLastDraw: " + ticker.msSinceLastDraw);
          }
          if (ticker.main.animMethod === 'setTimeout') {
            ticker.draw();
          } else {
            ticker.throttledDraw();
          }
          if (ticker.main.debug) {
            t2 = (new Date()).getTime();
            msDrawTime = t2 - t;
            ticker.lastTickTime = t;
            console.log("msDrawTime: " + msDrawTime);
          }
          if ((ticker.numTicks % 100) === 0) keyboard.clearStuckKeys(t);
          if (ticker.main.animMethod === 'setTimeout') {
            ticker.timer = window.setTimeout(ticker.tick, ticker.tickInterval);
          } else {
            ticker.timer = window.requestAnimFrame(ticker.tick, viewport.canvas.element);
          }
          return ticker.numTicks++;
        },
        draw: function() {
          var entity, _i, _len, _ref;
          this.main.viewport.draw();
          _ref = this.main.entities;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            entity = _ref[_i];
            entity.tick();
          }
          return this.numDraws++;
        }
      });
    }
  };
  return core;
});
