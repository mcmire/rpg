(function() {

  define('game.MapTile', function() {
    var MapTile, assignable, meta, simpleDrawable, _ref;
    meta = require('meta');
    _ref = require('roles'), assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;
    MapTile = meta.def('game.MapTile', assignable, simpleDrawable, {
      init: function(drawable) {
        this.drawable = drawable;
        return this.mbounds = require('game.Bounds').rect(0, 0, this.drawable.width, this.drawable.height);
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
    return MapTile;
  });

}).call(this);
