
define(function(require) {
  var Bounds, Collidable, Mob, Sprite, meta;
  meta = require('app/meta2');
  Sprite = require('app/sprite');
  Collidable = require('app/collidable');
  Bounds = require('app/bounds');
  Mob = meta.def('game.Mob', Sprite, Collidable, {
    init: function(image, width, height, speed) {
      this._super(image, width, height);
      return this.speed = speed;
    },
    _initBoundsOnMap: function() {
      this._initFence();
      return this._super();
    },
    _initFence: function() {
      return this.fence = Bounds.rect(0, 0, this.map.width, this.map.height);
    },
    predraw: function() {
      var _name;
      this._super();
      if (typeof this[_name = this.state.moveHandler] === "function") {
        this[_name]();
      }
      return this._recalculateViewportBounds();
    }
  });
  return Mob;
});
