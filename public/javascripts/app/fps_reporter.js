
define(function(require) {
  var fpsReporter, intervalTicker;
  intervalTicker = require('app/ticker').intervalTicker;
  fpsReporter = intervalTicker.construct('game.fpsReporter', {
    init: function(main) {
      var draw;
      this._super(main);
      draw = this.draw;
      this.tickInterval = 1000;
      this.tickFunction = this.main.createIntervalTimer(true, function(df, dt) {
        return draw(df, dt);
      });
      return this.$element = $('<div id="fps-reporter" />');
    },
    draw: function(df, dt) {
      var fps;
      fps = ((df / dt) * 1000).toFixed(1);
      return this.$element.text("" + fps + " FPS");
    }
  });
  return fpsReporter;
});
