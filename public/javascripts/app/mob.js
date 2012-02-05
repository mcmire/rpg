
define(function(require) {
  var Bounds, Collidable, Grob, Mob, drawable, meta, sprites;
  meta = require('app/meta2');
  Grob = require('app/grob');
  sprites = require('app/images').sprites;
  drawable = require('app/roles').drawable;
  Collidable = require('app/collidable');
  Bounds = require('app/bounds');
  Mob = Grob.clone().extend(drawable, Collidable, {
    init: function(imagePath, width, height, speed) {
      this._super(imagePath, width, height);
      return this.speed = speed;
    },
    predraw: function() {
      this._super();
      return this._recalculateViewportBounds();
    },
    draw: function() {
      this.sprite.clear();
      return this._super();
    },
    _initBoundsOnMap: function() {
      this._initFence();
      return this._super();
    },
    _initFence: function() {
      return this.fence = Bounds.rect(0, 0, this.map.width, this.map.height);
    }
  });
  return Mob;
});
