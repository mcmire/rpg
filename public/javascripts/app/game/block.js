(function() {
  var Block, Collidable, Mappable, assignable, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  assignable = game.roles.assignable;

  Mappable = game.Mappable;

  Collidable = game.Collidable;

  Block = meta.def('game.Block', assignable, Mappable, Collidable, {
    _initCollidableBounds: function() {
      return this.cbounds = game.Bounds.rect(0, 0, this.width, this.height);
    }
  });

  game.Block = Block;

  window.scriptLoaded('app/block');

}).call(this);
