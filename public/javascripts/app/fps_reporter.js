(function() {
  var Canvas, game;

  game = window.game;

  Canvas = game.Canvas;

  game.util.module("game.FpsReporter", {
    drawInterval: 1000,
    init: function(main) {
      this.main = main;
      if (!this.isInit) {
        this.reset();
        this.$div = $('<div id="fps-reporter" />');
        this.isInit = true;
      }
      return this;
    },
    destroy: function() {
      if (this.isInit) {
        this.reset();
        this.isInit = false;
      }
      return this;
    },
    reset: function() {
      this.numFramesSinceDraw = 0;
      this.timeSinceDraw = (new Date()).getTime();
      return this;
    },
    attachTo: function(container) {
      return $(container).append(this.$div);
    },
    detach: function() {
      return this.$div.detach();
    },
    draw: function(df, dt) {
      var fps;
      fps = ((df / dt) * 1000).toFixed(1);
      return this.$div.text("" + fps + " FPS");
    }
  });

}).call(this);
