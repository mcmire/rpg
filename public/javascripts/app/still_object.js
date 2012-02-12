(function() {
  var Block, Collidable, Mappable, StillObject, assignable, drawable, game, meta, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  Block = game.Block;

  _ref = game.roles, assignable = _ref.assignable, drawable = _ref.drawable;

  Mappable = game.Mappable;

  Collidable = game.Collidable;

  StillObject = meta.def('game.StillObject', assignable, Mappable, Collidable, drawable, {
    init: function(imagePath, width, height) {
      this._super(width, height);
      this.image = game.imageCollection.get(imagePath);
      return this;
    },
    activate: function() {},
    deactivate: function() {},
    draw: function(ctx) {
      var b;
      b = this.mbounds;
      return this.image.draw(ctx, b.x1, b.y1);
    }
  });

  game.StillObject = StillObject;

  window.scriptLoaded('app/still_object');

}).call(this);
