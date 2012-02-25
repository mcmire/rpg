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
    predraw: function(ctx) {
      return this.image.clear(ctx, this.mbounds.x1, this.mbounds.y1);
    },
    draw: function(ctx) {
      return this.image.draw(ctx, this.mbounds.x1, this.mbounds.y1);
    }
  });

  game.StillObject = StillObject;

}).call(this);
