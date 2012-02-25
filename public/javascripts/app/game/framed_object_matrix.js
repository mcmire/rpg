(function() {
  var game;

  (game = this.game).define('FramedObjectMatrix', function(name) {
    var FramedObjectMatrix;
    FramedObjectMatrix = this.meta.def(name, {
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
    return FramedObjectMatrix;
  });

}).call(this);
