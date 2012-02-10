(function() {
  var Block, Collidable, Mappable, assignable, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  assignable = game.roles.assignable;

  Mappable = game.Mappable;

  Collidable = game.Collidable;

  Block = Mob.extend('game.Block', assignable, Mappable, Collidable, {
    assignTo: function(parent) {
      this._super(parent);
      return this.map = parent;
    }
  });

  game.MapBlock = MapBlock;

  window.scriptLoaded('app/block');

}).call(this);
