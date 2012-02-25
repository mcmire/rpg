(function() {
  var game;

  (game = this.game).define('Map', function(name) {
    var Map;
    Map = this.meta.def(name, this.roles.tickable, {
      init: function(name, width, height, fn) {
        var bg, fg;
        this.name = name;
        this.width = width;
        this.height = height;
        fg = game.Foreground.create(this, this.width, this.height);
        bg = game.Background.create(this, this.width, this.height);
        fn(fg, bg);
        this.foreground = fg;
        this.background = bg;
        this.up = this.down = this.left = this.right = null;
        return this.isActive = false;
      },
      assignTo: function(viewport) {
        this.viewport = viewport;
        this.foreground.assignToViewport(this.viewport);
        return this.background.assignToViewport(this.viewport);
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
      attachToViewport: function() {
        this.foreground.attachTo(this.viewport);
        this.background.attachTo(this.viewport);
        return this;
      },
      detachFromViewport: function() {
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
