(function() {
  var game;

  (game = this.game).define('FilteredObjectMatrix', function(name) {
    var FilteredObjectMatrix;
    FilteredObjectMatrix = this.meta.def(name, {
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
    return FilteredObjectMatrix;
  });

}).call(this);
