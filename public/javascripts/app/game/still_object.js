(function() {
  var game;

  (game = this.game).define('StillObject', function(name) {
    var StillObject;
    StillObject = this.meta.def(name, this.roles.assignable, this.roles.Mappable, this.roles.Collidable, this.roles.drawable, {
      init: function(imagePath, width, height) {
        this._super(width, height);
        this.image = game.imageCollection.get(imagePath);
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
