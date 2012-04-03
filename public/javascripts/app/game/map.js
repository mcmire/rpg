(function() {

  define('game.Map', function() {
    var Map, assignable, attachable, meta, tickable, _ref;
    meta = require('meta');
    _ref = require('roles'), assignable = _ref.assignable, attachable = _ref.attachable, tickable = _ref.tickable;
    Map = meta.def(assignable, attachable, tickable, {
      init: function(name, width, height, fn) {
        var bg, fg;
        this.name = name;
        this.width = width;
        this.height = height;
        fg = require('game.Foreground').create(this, this.width, this.height);
        bg = require('game.Background').create(this, this.width, this.height);
        fn(fg, bg);
        this.foreground = fg;
        this.background = bg;
        this.up = this.down = this.left = this.right = null;
        return this.isActive = false;
      },
      setParent: function(parent) {
        this._super(parent);
        this.viewport = parent;
        this.foreground.setParent(parent);
        return this.background.setParent(parent);
      },
      addPlayer: function(player) {
        this.player = player;
        return this.foreground.addPlayer(player);
      },
      load: function() {
        this.foreground.load();
        return this.background.load();
      },
      unload: function() {
        this.foreground.unload();
        return this.background.unload();
      },
      attach: function() {
        this.foreground.attach();
        this.background.attach();
        return this;
      },
      detach: function() {
        this.foreground.detach();
        this.background.detach();
        return this;
      },
      activate: function() {
        this.isActive = true;
        return this.foreground.activate();
      },
      deactivate: function() {
        this.isActive = false;
        return this.player.removeEvents();
      },
      tick: function() {
        if (this.isActive) {
          this.background.tick();
          return this.foreground.tick();
        }
      },
      connectsUpTo: function(other) {
        return this.up = other;
      },
      connectsDownTo: function(other) {
        return this.down = other;
      },
      connectsLeftTo: function(other) {
        return this.left = other;
      },
      connectsRightTo: function(other) {
        return this.right = other;
      }
    });
    return Map;
  });

}).call(this);
