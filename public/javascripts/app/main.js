
define(function(require) {
  var Class, attachable, core, eventable, keyboard, main, module, plug, _ref, _ref2;
  _ref = require('app/meta'), Class = _ref.Class, module = _ref.module;
  _ref2 = require('app/roles'), eventable = _ref2.eventable, attachable = _ref2.attachable;
  plug = require('app/plug');
  keyboard = require('app/keyboard');
  core = require('app/core');
  main = meta.def('game.main', eventable, attachable, tickable, runnable);
  main.extend({
    imagesPath: '/images',
    debug: false,
    init: function() {
      this._super();
      this.keyboard = keyboard.init();
      this.core = core.assignTo(this).init();
      this.attach();
      this.addEvents();
      return this.run();
    },
    setElement: function() {
      return this.$element = $('#main');
    },
    attach: function() {
      this.core.attach();
      return this.$element.appendTo(document.body);
    },
    addEvents: function() {
      var self;
      self = this;
      this.keyboard.addEvents();
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
      this.keyboard.removeEvents();
      return this.unbindEvents(window, 'blur', 'focus');
    },
    load: function(callback) {
      var assetCollections, c, i, self, ticker, _i, _len;
      assetCollections = [];
      assetCollections.push(require('app/images'));
      for (_i = 0, _len = assetCollections.length; _i < _len; _i++) {
        c = assetCollections[_i];
        c.load();
      }
      self = this;
      i = 0;
      return ticker = window.setInterval((function() {
        var c, isLoaded;
        i++;
        if (i === 20) {
          window.clearInterval(ticker);
          ticker = null;
          throw new Error("Assets haven't been loaded yet?!");
          return;
        }
        console.log("Checking to see if all assets are loaded...");
        isLoaded = (function() {
          var _j, _len2, _results;
          _results = [];
          for (_j = 0, _len2 = assetCollections.length; _j < _len2; _j++) {
            c = assetCollections[_j];
            _results.push(c.isLoaded());
          }
          return _results;
        })();
        if (isLoaded) {
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
    start: function() {
      return this.core.start();
    },
    stop: function() {
      return this.core.stop();
    },
    tick: function() {
      return this.core.tick();
    },
    resolveImagePath: function(path) {
      return "" + this.imagesPath + "/" + path;
    }
  });
  return main;
});
