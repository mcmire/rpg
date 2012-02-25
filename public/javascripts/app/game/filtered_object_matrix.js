(function() {
  var FilteredObjectMatrix, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  FilteredObjectMatrix = meta.def('game.FilteredObjectMatrix', {
    without: function(exception) {
      this.exception = exception;
      return this;
    },
    each: function(fn) {
      var self;
      self = this;
      return this._super(function(object) {
        var ret;
        if (object !== self.exception) {
          ret = fn(object);
          if (ret === false) return false;
        }
      });
    }
  });

  game.FilteredObjectMatrix = FilteredObjectMatrix;

}).call(this);
