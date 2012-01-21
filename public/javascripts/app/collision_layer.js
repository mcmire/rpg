
define(function(require) {
  var Bounds, Class, CollidableBox, CollidableCollection, Grob, MapBlock, collisionLayer, loadable, module, tickable, _ref, _ref2;
  _ref = require('app/meta'), Class = _ref.Class, module = _ref.module;
  Grob = require('app/grob');
  Bounds = require('app/bounds');
  _ref2 = require('app/roles'), loadable = _ref2.loadable, tickable = _ref2.tickable;
  CollidableCollection = Class.extend('game.CollidableCollection', {
    init: function() {
      return this.collidables = [];
    },
    getMapBlocks: function() {
      var c, _i, _len, _ref3, _results;
      _ref3 = this.collidables;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        c = _ref3[_i];
        if (c instanceof MapBlock) _results.push(c);
      }
      return _results;
    },
    each: function(fn) {
      var c, collidable, ret, _i, _j, _len, _len2, _ref3, _ref4, _results, _results2;
      if (this.exception) {
        _ref3 = this.collidables;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          c = _ref3[_i];
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
        _ref4 = this.collidables;
        _results2 = [];
        for (_j = 0, _len2 = _ref4.length; _j < _len2; _j++) {
          collidable = _ref4[_j];
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
  MapBlock = Grob.extend('game.MapBlock', {
    init: function(main, x1, y1, width, height) {
      this._initDims = function() {
        this.width = width;
        return this.height = height;
      };
      this.initBoundsOnMap = function() {
        return this.bounds.onMap = Bounds.rect(x1, y1, width, height);
      };
      return this._super(main);
    },
    tick: function() {}
  });
  CollidableBox = Class.extend('game.CollidableBox', {
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
  collisionLayer = module('game.collisionLayer', loadable, tickable, {
    init: function(main) {
      var collidable, _i, _len, _ref3, _results;
      this.main = main;
      this.viewport = this.main.viewport;
      this.width = this.viewport.width;
      this.height = this.viewport.height;
      this.collidables = new CollidableCollection();
      this.add(new MapBlock(this.main, 96, 96, 352, 112));
      _ref3 = this.collidables;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        collidable = _ref3[_i];
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
      var collidable, _i, _len, _ref3, _results;
      _ref3 = this.collidables.getMapBlocks();
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        collidable = _ref3[_i];
        _results.push(collidable.tick());
      }
      return _results;
    }
  });
  require({
    CollidableCollection: CollidableCollection
  });
  return {
    MapBlock: MapBlock,
    CollidableBox: CollidableBox,
    collisionLayer: collisionLayer
  };
});
