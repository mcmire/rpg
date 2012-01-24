
define(function(require) {
  var Bounds, Grob, MapBlock;
  Grob = require('app/grob');
  Bounds = require('app/bounds');
  MapBlock = Grob.extend('game.MapBlock', {
    init: function(core, x1, y1, width, height) {
      this._initDims = function() {
        this.width = width;
        return this.height = height;
      };
      this._initBoundsOnMap = function() {
        return this.bounds.onMap = Bounds.rect(x1, y1, width, height);
      };
      return this._super(core);
    },
    tick: function() {}
  });
  return MapBlock;
});
