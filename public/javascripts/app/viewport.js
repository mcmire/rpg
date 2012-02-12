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
      var p, pb, phh, pwh, vhh, vwh, x1, y1;
      p = this.core.player;
      pb = p.mbounds;
      pwh = Math.round(p.width / 2);
      phh = Math.round(p.height / 2);
      vwh = Math.round(this.width / 2);
      vhh = Math.round(this.height / 2);
      x1 = pb.x1 + pwh - vwh;
      if (x1 < 0) x1 = 0;
      y1 = pb.y1 + phh - vhh;
      if (y1 < 0) y1 = 0;
      return this.bounds = game.Bounds.rect(x1, y1, this.width, this.height);
    }
  });

  game.viewport = viewport;

  window.scriptLoaded('app/viewport');

}).call(this);
