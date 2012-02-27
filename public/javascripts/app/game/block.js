(function() {

  define('game.Block', function() {
    var Block, Collidable, Mappable, assignable, meta;
    meta = require('meta');
    assignable = require('roles').assignable;
    Mappable = require('game.Mappable');
    Collidable = require('game.Collidable');
    Block = meta.def(assignable, Mappable, Collidable, {
      _initCollidableBounds: function() {
        return this.cbounds = require('game.Bounds').rect(0, 0, this.width, this.height);
      }
    });
    return Block;
  });

}).call(this);
