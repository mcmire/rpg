(function() {
  var CollidableBox, CollidableCollection, MapBlock, collisionLayer, g;

  g = window.game || (window.game = {});

  CollidableCollection = g.Class.extend('game.CollidableCollection', {
    init: function() {
      return this.collidables = [];
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
      var c, collidable, ret, _i, _j, _len, _len2, _ref, _ref2, _results, _results2;
      if (this.exception) {
        _ref = this.collidables;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
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
    intersectsWith: function(bounds) {
      var ret;
      ret = false;
      this.each(function(collidable) {
        if (collidable.box.intersectsWith(bounds)) {
          ret = true;
          return false;
        }
      });
      return ret;
    },
    getOuterLeftEdgeBlocking: function(bounds) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.box.getOuterLeftEdgeBlocking(bounds)) return false;
      });
      return ret;
    },
    getOuterRightEdgeBlocking: function(bounds) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.box.getOuterRightEdgeBlocking(bounds)) return false;
      });
      return ret;
    },
    getOuterTopEdgeBlocking: function(bounds) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.box.getOuterTopEdgeBlocking(bounds)) return false;
      });
      return ret;
    },
    getOuterBottomEdgeBlocking: function(bounds) {
      var ret;
      ret = null;
      this.each(function(collidable) {
        if (ret = collidable.box.getOuterBottomEdgeBlocking(bounds)) return false;
      });
      return ret;
    }
  });

  MapBlock = g.Grob.extend('game.MapBlock', {
    init: function(main, x1, y1, width, height) {
      this._initDims = function() {
        this.width = width;
        return this.height = height;
      };
      this.initBoundsOnMap = function() {
        return this.bounds.onMap = g.Bounds.rect(x1, y1, width, height);
      };
      return this._super(main);
    },
    tick: function() {}
  });

  CollidableBox = g.Class.extend('game.CollidableBox', {
    init: function(bounds) {
      this.bounds = bounds;
    },
    intersectsWith: function(bounds) {
      return this.bounds.intersectsWith(bounds);
    },
    getOuterLeftEdgeBlocking: function(bounds) {
      return this.bounds.getOuterLeftEdgeBlocking(bounds);
    },
    getOuterRightEdgeBlocking: function(bounds) {
      return this.bounds.getOuterRightEdgeBlocking(bounds);
    },
    getOuterTopEdgeBlocking: function(bounds) {
      return this.bounds.getOuterTopEdgeBlocking(bounds);
    },
    getOuterBottomEdgeBlocking: function(bounds) {
      return this.bounds.getOuterBottomEdgeBlocking(bounds);
    }
  });

  collisionLayer = g.module('game.collisionLayer', g.loadable, g.tickable, {
    init: function(main) {
      var collidable, _i, _len, _ref, _results;
      this.main = main;
      this.viewport = this.main.viewport;
      this.width = this.viewport.width;
      this.height = this.viewport.height;
      this.collidables = new CollidableCollection();
      this.add(new MapBlock(this.main, 96, 96, 352, 112));
      _ref = this.collidables;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        collidable = _ref[_i];
        _results.push(this.add(collidable));
      }
      return _results;
    },
    add: function(collidable) {
      return this.collidables.push(collidable);
    },
    load: function() {
      return this.isLoaded = true;
    },
    tick: function() {
      var collidable, _i, _len, _ref, _results;
      _ref = this.collidables.getMapBlocks();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        collidable = _ref[_i];
        _results.push(collidable.tick());
      }
      return _results;
    }
  });

  g.CollidableCollection = CollidableCollection;

  g.MapBlock = MapBlock;

  g.CollidableBox = CollidableBox;

  g.collisionLayer = collisionLayer;

}).call(this);
