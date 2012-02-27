(function() {

  define('game.FramedObjectMatrix', function() {
    var meta;
    meta = require('meta');
    return meta.def({
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
  });

}).call(this);
