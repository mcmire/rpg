(function() {
  var Map, assignable, attachable, common, game, meta, tickable, _ref;

  common = (window.common || (window.common = {}));

  meta = common.meta;

  _ref = common.roles, assignable = _ref.assignable, attachable = _ref.attachable, tickable = _ref.tickable;

  game = (window.game || (window.game = {}));

  Map = meta.def('game.Map', assignable, attachable, tickable, {
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
    setParent: function(parent) {
      this._super(parent);
      this.viewport = viewport;
      this.foreground.setParent(viewport);
      return this.background.setParent(viewport);
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

  game.Map = Map;

}).call(this);
