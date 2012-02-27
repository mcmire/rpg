(function() {

  define('game.SortedObjectMatrix', function() {
    var SortedObjectMatrix, meta;
    meta = require('meta');
    SortedObjectMatrix = meta.def({
      init: function(map) {
        this.map = map;
        return this.rows = require('game.OrderedMap').create();
      },
      add: function(object) {
        var row, x, y, _ref;
        _ref = [object.mbounds.y1, object.mbounds.x1], y = _ref[0], x = _ref[1];
        if (!(row = this.rows.get(y))) {
          row = require('game.OrderedMap').create();
          this.rows.set(y, row);
        }
        return row.set(x, object);
      },
      remove: function(object) {
        var row, x, y, _ref;
        _ref = [object.mbounds.y1, object.mbounds.x1], y = _ref[0], x = _ref[1];
        if (row = this.rows.get(y)) {
          row["delete"](x);
          if (row.isEmpty()) return this.rows["delete"](y);
        }
      },
      each: function(fn) {
        return this.rows.each(function(row) {
          var ret;
          ret = row.each(function(object) {
            var ret2;
            ret2 = fn(object);
            if (ret2 === false) return false;
          });
          if (ret === false) return false;
        });
      },
      getObjects: function() {
        var objects;
        objects = [];
        this.each(function(object) {
          return objects.push(object);
        });
        return objects;
      }
    });
    SortedObjectMatrix.aliases({
      add: 'push',
      remove: 'delete'
    });
    return SortedObjectMatrix;
  });

}).call(this);
