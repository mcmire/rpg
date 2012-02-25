(function() {
  var game;

  (game = this.game).define('Block', function(name) {
    var Block;
    Block = this.meta.def(name, this.roles.assignable, this.Mappable, this.Collidable, {
      _initCollidableBounds: function() {
        return this.cbounds = game.Bounds.rect(0, 0, this.width, this.height);
      }
    });
    return Block;
  });

}).call(this);
