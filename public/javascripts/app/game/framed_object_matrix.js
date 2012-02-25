(function() {
  var FramedObjectMatrix, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  FramedObjectMatrix = meta.def('game.FramedObjectMatrix', {
    frameWithin: function(bounds) {
      this.bounds = bounds;
      return this;
    },
    each: function(fn) {
      var self;
      self = this;
      return this._super(function(object) {
        var ret;
        if (self.bounds.doesContain(object)) {
          ret = fn(object);
          if (ret === false) return false;
        }
      });
    }
  });

  game.FramedObjectMatrix = FramedObjectMatrix;

  window.scriptLoaded('app/framed_object_matrix');

}).call(this);
