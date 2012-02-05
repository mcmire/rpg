(function() {
  var Class, CollidableCollection, Grob, MapBlock, game, _boundsFrom,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  Class = game.Class;

  MapBlock = game.MapBlock;

  Grob = game.Grob;

  _boundsFrom = function(boundsOrGrob) {
    if (boundsOrGrob instanceof Grob) {
      return boundsOrGrob.bounds.onMap;
    } else {
      return boundsOrGrob;
    }
  };

  CollidableCollection = Class.extend('game.CollidableCollection', {
    init: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length) {
        return this.collidables = args[0], this.exception = args[1], args;
      } else {
        return this.collidables = [];
      }
    },
    getMapBlocks: function() {
      var c, _i, _len, _ref, _results;
      _ref = this.collidables;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c instanceof MapBlock) _results.push(c);
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
    without: function(collidable) {
      return new this.constructor(this.collidables, collidable);
    },
    intersectsWith: function(boundsOrGrob) {
      var bounds, ret;
      bounds = _boundsFrom(boundsOrGrob);
      ret = false;
      this.each(function(collidable) {
        if (collidable.intersectsWith(bounds)) {
          ret = true;
          return false;
        }
      });
      return ret;
    },
    getOuterLeftEdgeBlocking: function(boundsOrGrob) {
      var bounds, ret;
      bounds = _boundsFrom(boundsOrGrob);
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterLeftEdgeBlocking(bounds)) return false;
      });
      return ret;
    },
    getOuterRightEdgeBlocking: function(boundsOrGrob) {
      var bounds, ret;
      bounds = _boundsFrom(boundsOrGrob);
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterRightEdgeBlocking(bounds)) return false;
      });
      return ret;
    },
    getOuterTopEdgeBlocking: function(boundsOrGrob) {
      var bounds, ret;
      bounds = _boundsFrom(boundsOrGrob);
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterTopEdgeBlocking(bounds)) return false;
      });
      return ret;
    },
    getOuterBottomEdgeBlocking: function(boundsOrGrob) {
      var bounds, ret;
      bounds = _boundsFrom(boundsOrGrob);
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.getOuterBottomEdgeBlocking(bounds)) return false;
      });
      return ret;
    }
  });

  game.CollidableCollection = CollidableCollection;

  window.numScriptsLoaded++;

}).call(this);
