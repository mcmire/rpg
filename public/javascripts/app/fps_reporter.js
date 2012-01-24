
define(function(require) {
  var attachable, fpsReporter, intervalTicker;
  intervalTicker = require('app/ticker').intervalTicker;
  attachable = require('app/roles').attachable;
  fpsReporter = intervalTicker.construct('game.fpsReporter', attachable, {
    init: function(main) {
      this.main = main;
      this.core = this.main.core;
      this._super(this.main);
      this.tickInterval = 1000;
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
