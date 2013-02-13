(function() {
  var __slice = Array.prototype.slice;

  define('game.Collidable', function() {
    var Collidable, meta;
    meta = require('meta');
    Collidable = meta.def('game.Collidable', {
      init: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        this._super.apply(this, args);
        return this._initCollidableBounds();
      },
      assignToMap: function(map) {
        this._super(map);
        this._initCollidables();
        return this;
      },
      doToMapBounds: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        this.map.objects.remove(this);
        this._super.apply(this, args);
        return this.map.objects.add(this);
      },
      setMapPosition: function(x, y) {
        this._super(x, y);
        return this.cbounds.anchor(x, y);
      },
      translate: function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        this._super.apply(this, args);
        return (_ref = this.cbounds).translate.apply(_ref, args);
      },
      translateBySide: function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        this._super.apply(this, args);
        return (_ref = this.cbounds).translateBySide.apply(_ref, args);
      },
      intersectsWith: function(other) {
        return this.cbounds.intersectsWith(other);
      },
      getOuterLeftEdgeBlocking: function(other) {
        return this.cbounds.getOuterLeftEdgeBlocking(other);
      },
      getOuterRightEdgeBlocking: function(other) {
        return this.cbounds.getOuterRightEdgeBlocking(other);
      },
      getOuterTopEdgeBlocking: function(other) {
        return this.cbounds.getOuterTopEdgeBlocking(other);
      },
      getOuterBottomEdgeBlocking: function(other) {
        return this.cbounds.getOuterBottomEdgeBlocking(other);
      },
      _initCollidableBounds: function() {
        return this.cbounds = require('game.Bounds').rect(0, 0, this.width, this.height - 8);
      },
      _initCollidables: function() {
        return this.mapCollidables = this.map.getObjectsWithout(this);
      }
    });
    return Collidable;
  });

}).call(this);
