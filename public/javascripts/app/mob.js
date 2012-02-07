(function() {
  var Grob, Mob, drawable, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  drawable = game.roles.drawable;

  Grob = game.Grob;

  Mob = Grob.cloneAs('game.Mob').extend({
    init: function(imagePath, width, height, speed) {
      this._super(imagePath, width, height);
      return this.speed = speed;
    }
  });

  ({
    predraw: function() {
      this._super();
      return this.recalculateViewportBounds();
    },
    draw: function() {
      console.log('grob draw');
      this.currentState.sequence.clear(this.ctx);
      return this._super();
    },
    _initBoundsOnMap: function() {
      this._initFence();
      return this._super();
    },
    _initFence: function() {
      return this.fence = game.Bounds.rect(0, 0, this.map.width, this.map.height);
    }
  });

  game.Mob = Mob;

  window.scriptLoaded('app/mob');

}).call(this);
