
define(function(require) {
  var attachable, core, eventable, keyboard, main, meta, runnable, tickable, _ref;
  meta = require('app/meta2');
  _ref = require('app/roles'), eventable = _ref.eventable, attachable = _ref.attachable, tickable = _ref.tickable, runnable = _ref.runnable;
  keyboard = require('app/keyboard');
  core = require('app/core');
  main = meta.def('game.main', eventable, attachable, tickable, runnable);
  main.extend({
    imagesPath: '/images',
    debug: false,
    init: function() {
      this._super(document.body);
      this.keyboard = keyboard.init();
      this.core = core.init(this);
      this.attach();
      this.addEvents();
      this.run();
      return this;
    },
    setElement: function() {
      return this.$element = $('#main');
    },
    attach: function() {
      this._super();
      this.core.attach();
      return this;
    },
    addEvents: function() {
      var self;
      self = this;
      this.keyboard.addEvents();
      this.bindEvents(window, {
        blur: function() {
          return self.suspend();
        },
        focus: function() {
          return self.resume();
        }
      });
      return this;
    },
    removeEvents: function() {
      this.keyboard.removeEvents();
      this.unbindEvents(window, 'blur', 'focus');
      return this;
    },
    load: function(callback) {
      var assetCollections, c, fn, i, imageCollection, self, timer, _i, _len;
      self = this;
      assetCollections = [];
      imageCollection = require('app/images')(this);
      assetCollections.push(imageCollection);
      i = 0;
      timer = null;
      fn = function() {
        var isLoaded;
        i++;
        if (i === 20) {
          window.clearTimeout(timer);
          timer = null;
          throw new Error("Assets haven't been loaded yet?!");
          return;
        }
        console.log("Checking to see if all assets are loaded...");
        isLoaded = $.v.every(assetCollections, function(c) {
          return c.isLoaded();
        });
        if (isLoaded) {
          console.log("All assets have been loaded, hey!");
          window.clearTimeout(timer);
          timer = null;
          return callback();
        } else {
          return timer = window.setTimeout(fn, 100);
        }
      };
      fn();
      for (_i = 0, _len = assetCollections.length; _i < _len; _i++) {
        c = assetCollections[_i];
        c.load();
      }
      return this;
    },
    run: function() {
      main.load(function() {
        return main.start();
      });
      return this;
    },
    start: function() {
      this.core.start();
      return this;
    },
    stop: function() {
      this.core.stop();
      return this;
    },
    suspend: function() {
      console.log("Suspending...");
      this.core.suspend();
      return this;
    },
    resume: function() {
      console.log("Resuming...");
      this.core.resume();
      return this;
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
