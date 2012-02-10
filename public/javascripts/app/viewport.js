(function() {
  var attachable, game, meta, tickable, viewport, _ref,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, attachable = _ref.attachable, tickable = _ref.tickable;

  viewport = meta.def('game.viewport', attachable, {
    width: 512,
    height: 448,
    init: function(core, player) {
      this.core = core;
      this.player = player;
      return this._super(this.core);
    },
    setElement: function() {
      return this.$element = $('<div id="viewport" />').css({
        width: this.width,
        height: this.height
      });
    },
    setMap: function(map) {
      this.currentMap = map;
      return this._setBounds();
    },
    unsetMap: function() {
      return this.currentMap.detach();
    },
    translate: function() {
      var args, _ref2;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_ref2 = this.bounds).translate.apply(_ref2, args);
      return this;
    },
    translateBySide: function(side, value) {
      return this.bounds.translateBySide(side, value);
    },
    inspect: function() {
      return JSON.stringify({
        "bounds": this.bounds.inspect()
      });
    },
    debug: function() {
      return console.log("viewport.bounds = " + (this.bounds.inspect()));
    },
    _setBounds: function() {
      return this.bounds = game.Bounds.rect(0, 0, this.width, this.height);
    }
  });

  game.viewport = viewport;

  window.scriptLoaded('app/viewport');

}).call(this);
