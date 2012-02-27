(function() {

  define('game.StillObject', function() {
    var Collidable, Mappable, StillObject, assignable, drawable, meta, _ref;
    meta = require('meta');
    _ref = require('roles'), assignable = _ref.assignable, drawable = _ref.drawable;
    Mappable = require('game.Mappable');
    Collidable = require('game.Collidable');
    StillObject = meta.def('game.StillObject', assignable, Mappable, Collidable, drawable, {
      init: function(imagePath, width, height) {
        this._super(width, height);
        this.image = require('game.imageCollection').get(imagePath);
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
    return StillObject;
  });

}).call(this);
