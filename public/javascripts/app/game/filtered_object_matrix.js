(function() {

  define('game.FilteredObjectMatrix', function() {
    var meta;
    meta = require('meta');
    return meta.def('game.FilteredObjectMatrix', {
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
  });

}).call(this);
