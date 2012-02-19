(function() {
  var attachable, fpsReporter, game, meta, ticker;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  ticker = game.ticker;

  attachable = game.roles.attachable;

  fpsReporter = ticker.cloneAs('game.fpsReporter').extend(attachable, {
    init: function(main) {
      var self;
      this.main = main;
      self = this;
      this.attachTo(this.main.core.viewport);
      this.setElement($('<div id="fps-reporter">00.0 FPS</div>'));
      this.tickInterval = 1000;
      this.drawFn = game.core.createIntervalTimer(false, function(df, dt) {
        return self.draw(self, df, dt);
      });
      return this;
    },
    start: function() {
      return this.timer = window.setInterval(this.drawFn, this.tickInterval);
    },
    stop: function() {
      if (this.timer) {
        window.clearInterval(this.timer);
        return this.timer = null;
      }
    },
    draw: function(fpsReporter, df, dt) {
      var fps;
      fps = ((df / dt) * 1000).toFixed(1);
      return fpsReporter.getElement().addClass('loaded').text("" + fps + " FPS");
    }
  });

  game.fpsReporter = fpsReporter;

  window.scriptLoaded('app/fps_reporter');

}).call(this);
