
define(function(require) {
  var Class, attachable, core, eventable, fpsReporter, keyboard, main, module, plug, _ref, _ref2;
  _ref = require('app/meta'), Class = _ref.Class, module = _ref.module;
  _ref2 = require('app/roles'), eventable = _ref2.eventable, attachable = _ref2.attachable;
  plug = require('app/plug');
  keyboard = require('app/keyboard');
  core = require('app/core');
  fpsReporter = require('app/fps_reporter');
  main = module('game.main', eventable, attachable, plug(keyboard, core), {
    debug: false,
    init: function() {
      this._super();
      this.$element = $('#main');
      this.attach();
      this.addEvents();
      return this.run();
    },
    attach: function() {
      this._super();
      return this.$element.appendTo(document.body);
    },
    addEvents: function() {
      var self;
      self = this;
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
    load: function(callback) {
      var i, self, ticker;
      this.plugins.loadable.run('load');
      self = this;
      i = 0;
      return ticker = window.setInterval((function() {
        i++;
        if (i === 20) {
          window.clearInterval(ticker);
          ticker = null;
          throw new Error("Grobs haven't been loaded yet?!");
          return;
        }
        console.log("Checking to see if all grobs are loaded...");
        if (self.plugins.loadable.every('isLoaded')) {
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
    }
  });
  return main;
});
