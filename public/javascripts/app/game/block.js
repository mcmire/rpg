(function() {
  var Block, Collidable, Mappable, assignable, common, game, meta;

  common = (window.common || (window.common = {}));

  game = (window.game || (window.game = {}));

  meta = common.meta;

  assignable = common.roles.assignable;

  Mappable = game.Mappable;

  Collidable = game.Collidable;

  Block = meta.def('game.Block', assignable, Mappable, Collidable, {
    _initCollidableBounds: function() {
      return this.cbounds = game.Bounds.rect(0, 0, this.width, this.height);
    }
  });

  game.Block = Block;

}).call(this);
