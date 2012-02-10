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
    },
    predraw: function() {
      return this._super();
    },
    draw: function() {
      return this._super();
    }
  });

  game.Mob = Mob;

  window.scriptLoaded('app/mob');

}).call(this);
