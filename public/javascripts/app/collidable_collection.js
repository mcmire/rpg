(function() {
  var CollidableCollection, game, meta,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  CollidableCollection = meta.def('game.CollidableCollection', {
    init: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length) {
        return this.collidables = args[0], this.exception = args[1], args;
      } else {
        return this.collidables = [];
      }
    },
    getBlocks: function() {
      var c, _i, _len, _ref, _results;
      _ref = this.collidables;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (game.Block.isPrototypeOf(c) && !game.Grob.isPrototypeOf(c)) {
          _results.push(c);
        }
      }
      return _results;
    },
    each: function(fn) {
      var collidable, ret, _i, _j, _len, _len2, _ref, _ref2, _results, _results2;
      if (this.exception) {
        _ref = this.collidables;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          collidable = _ref[_i];
          if (collidable !== this.exception) {
            ret = fn(collidable);
            if (ret === false) {
              break;
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else {
        _ref2 = this.collidables;
        _results2 = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          collidable = _ref2[_j];
          ret = fn(collidable);
          if (ret === false) {
            break;
          } else {
            _results2.push(void 0);
          }
        }
        return _results2;
      }
    },
    get: function(index) {
      return this.collidables[index];
    },
    push: function(collidable) {
      return this.collidables.push(collidable);
    },
    "delete": function(collidable) {
      return this.collidables["delete"](collidable);
    },
    without: function(collidable) {
      return this.create(this.collidables, collidable);
    },
    intersectsWith: function(other) {
      var ret;
      ret = false;
      this.each(function(collidable) {
        if (collidable.intersectsWith(other)) {
          ret = true;
          return false;
        }
      });
      return ret;
    },
    getOuterLeftEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterLeftEdgeBlocking(other)) return false;
      });
      return ret;
    },
    getOuterRightEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterRightEdgeBlocking(other)) return false;
      });
      return ret;
    },
    getOuterTopEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterTopEdgeBlocking(other)) return false;
      });
      return ret;
    },
    getOuterBottomEdgeBlocking: function(other) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterBottomEdgeBlocking(other)) return false;
      });
      return ret;
    }
  });

  game.CollidableCollection = CollidableCollection;

  window.scriptLoaded('app/collidable_collection');

}).call(this);
