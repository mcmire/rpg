(function() {

  define('game.fpsReporter', function() {
    var attachable, fpsReporter, meta, ticker;
    meta = require('meta');
    attachable = require('roles').attachable;
    ticker = require('game.ticker');
    fpsReporter = ticker.clone().extend(attachable, {
      init: function(main) {
        var self;
        this.main = main;
        self = this;
        this.setParentElement(this.main.core.viewport.getElement());
        this.setElement($('<div class="fps-reporter">00.0 FPS</div>'));
        this._initCheckbox();
        this.$playerDebug = $('<p/>');
        this.tickInterval = 1000;
        this.drawFn = require('game.core').createIntervalTimer(false, function(df, dt) {
          return self.draw(self, df, dt);
        });
        this.disable();
        return this;
      },
      attach: function() {
        this._super();
        this.main.getControlsDiv().append(this.$checkbox);
        return this.main.getControlsDiv().append(this.$playerDebug);
      },
      toggle: function() {
        if (this.isEnabled) {
          return this.disable();
        } else {
          return this.enable();
        }
      },
      enable: function() {
        this.getElement().show();
        this.start();
        return this.isEnabled = true;
      },
      disable: function() {
        this.getElement().hide().removeClass('first-draw');
        this.stop();
        return this.isEnabled = false;
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
        fpsReporter.getElement().addClass('first-draw').text("" + fps + " FPS");
        return this.$playerDebug.html(this.main.core.player.mbounds.inspect());
      },
      _initCheckbox: function() {
        var self;
        self = this;
        this.$checkbox = $('\
        <p class="fps-reporter">\
          <label>\
            <input type="checkbox" />\
            Show FPS\
          </label>\
        </p>\
      ');
        return this.$checkbox.on('change', function() {
          return self.toggle();
        });
      }
    });
    return fpsReporter;
  });

}).call(this);
