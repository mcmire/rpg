(function() {
  var Bounds, Grob, MapBlock, game;

  game = (window.game || (window.game = {}));

  Grob = game.Grob;

  Bounds = game.Bounds;

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

  game.MapBlock = MapBlock;

  window.numScriptsLoaded++;

}).call(this);
