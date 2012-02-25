(function() {
  var MapTile, assignable, game, meta, simpleDrawable, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;

  MapTile = meta.def('game.MapTile', assignable, simpleDrawable, {
    init: function(drawable) {
      this.drawable = drawable;
      return this.mbounds = game.Bounds.rect(0, 0, this.drawable.width, this.drawable.height);
    },
    setMapPosition: function(x, y) {
      return this.mbounds.anchor(x, y);
    },
    assignToMap: function(map) {
      this._super(map);
      this.map = map;
      this.drawable.assignTo(this);
      return this;
    },
    draw: function(ctx) {
      return this.drawable.draw(ctx, this.mbounds.x1, this.mbounds.y1);
    }
  });

  game.MapTile = MapTile;

  window.scriptLoaded('app/map_tile');

}).call(this);
