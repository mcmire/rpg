(function() {
  var fpsReporter, game;

  game = window.game;

  fpsReporter = game.util.module("game.fpsReporter");

  fpsReporter.drawInterval = 1000;

  fpsReporter.init = function(main) {
    var self;
    this.main = main;
    self = this;
    if (!this.isInit) {
      this.reset();
      this.$div = $('<div id="fps-reporter" />');
      this.drawer = this.main.createIntervalTimer(true, function(df, dt) {
        return self.draw(df, dt);
      });
      this.isInit = true;
    }
    return this;
  };

  fpsReporter.destroy = function() {
    if (this.isInit) {
      this.reset();
      this.isInit = false;
    }
    return this;
  };

  fpsReporter.reset = function() {
    this.numFramesSinceDraw = 0;
    this.timeSinceDraw = (new Date()).getTime();
    return this;
  };

  fpsReporter.attachTo = function(container) {
    return $(container).append(this.$div);
  };

  fpsReporter.detach = function() {
    return this.$div.detach();
  };

  fpsReporter.draw = function(df, dt) {
    var fps;
    fps = ((df / dt) * 1000).toFixed(1);
    return this.$div.text("" + fps + " FPS");
  };

  fpsReporter.start = function() {
    if (this.isRunning) return;
    this.timer = window.setInterval(this.drawer, 1000);
    this.isRunning = true;
    return this;
  };

  fpsReporter.stop = function() {
    if (!this.isRunning) return;
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    return this;
  };

  fpsReporter.suspend = function() {
    this.wasRunning = this.isRunning;
    return this.stop();
  };

  fpsReporter.resume = function() {
    if (this.wasRunning) return this.start();
  };

}).call(this);
