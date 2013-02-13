(function() {
  var attachable, game, meta, tickable, viewport, _ref,
    __slice = [].slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, attachable = _ref.attachable, tickable = _ref.tickable;

  viewport = meta.def('game.viewport', attachable, {
    width: 512,
    height: 448,
    init: function(core, player) {
      this.core = core;
      this.player = player;
      this._super(this.core);
      this.bounds = game.Bounds.rect(0, 0, this.width, this.height);
      return this;
    },
    setElement: function() {
      return this.$element = $('<div id="viewport" />').css({
        width: this.width,
        height: this.height
      });
    },
    attach: function() {
      this.parentElement.html("");
      this._super();
      return this.parentElement.append('<p>Controls: arrow keys (WASD also works too)</p>');
    },
    setMap: function(map) {
      this.currentMap = map;
      return this._setBounds();
    },
    unsetMap: function() {
      return this.currentMap.detach();
    },
    translate: function() {
      var args, _ref1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_ref1 = this.bounds).translate.apply(_ref1, args);
      return this;
    },
    translateBySide: function(side, value) {
      var ret;
      ret = this.bounds.translateBySide(side, value);
      return ret;
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
      if (x1 < 0) {
        x1 = 0;
      }
      y1 = pb.y1 + phh - vhh;
      if (y1 < 0) {
        y1 = 0;
      }
      return this.bounds.anchor(x1, y1);
    }
  });

  game.viewport = viewport;

  window.scriptLoaded('app/viewport');

}).call(this);
