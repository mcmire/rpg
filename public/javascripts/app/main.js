(function() {
  var g, main;

  g = window.game || (window.game = {});

  main = g.module('game.main', g.eventable, g.loadable, g.tickable, g.runnable, g.plug('keyboard', 'viewport', 'core', 'collisionLayer', 'Player', 'Enemy'), {
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

  g.main = main;

}).call(this);
