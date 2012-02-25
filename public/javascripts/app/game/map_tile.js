(function() {
  var game;

  (game = this.game).define('MapTile', function(name) {
    var MapTile;
    MapTile = this.meta.def(name, this.roles.assignable, this.roles.simpleDrawable, {
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
    return MapTile;
  });

}).call(this);
