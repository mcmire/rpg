(function() {
  var attachable, eventable, game, main, meta, runnable, tickable, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, eventable = _ref.eventable, attachable = _ref.attachable, tickable = _ref.tickable, runnable = _ref.runnable;

  main = meta.def('game.main', eventable, attachable, tickable, runnable, {
    imagesPath: '/images',
    debug: false,
    init: function() {
      this._super(document.body);
      this.keyboard = game.keyboard.init();
      this.core = game.core.init(this);
      this.addEvents();
      this.run();
      return this;
    },
    setElement: function() {
      return this.$element = $('#game');
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
      var assetCollections, c, fn, self, t, timer, _i, _len;
      self = this;
      assetCollections = [];
      assetCollections.push(game.imageCollection);
      t = new Date();
      timer = null;
      fn = function() {
        var isLoaded, t2;
        t2 = new Date();
        if ((t2 - t) > (10 * 1000)) {
          window.clearTimeout(timer);
          timer = null;
          console.log("Not all assets were loaded!");
          return;
        }
        console.log("Checking to see if all assets have been loaded...");
        isLoaded = $.v.every(assetCollections, function(c) {
          return c.isLoaded();
        });
        if (isLoaded) {
          console.log("Yup, looks like all assets are loaded now.");
          window.clearTimeout(timer);
          timer = null;
          return callback();
        } else {
          return timer = window.setTimeout(fn, 300);
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
      var self;
      self = this;
      main.load(function() {
        self.attach();
        return self.core.run();
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

  game.main = main;

  window.scriptLoaded('app/main');

}).call(this);
