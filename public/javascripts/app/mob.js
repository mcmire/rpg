(function() {
  var Bounds, Collidable, Grob, Mob, drawable, game, meta, sprites;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  Grob = game.Grob;

  sprites = game.images.sprites;

  drawable = game.roles.drawable;

  Collidable = game.Collidable;

  Bounds = game.Bounds;

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
      this.sprite.clear(this.ctx);
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

  game.Mob = Mob;

  window.numScriptsLoaded++;

}).call(this);
