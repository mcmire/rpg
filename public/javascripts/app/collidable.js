(function() {
  var Collidable, game, meta,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

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
    callOnMapBounds: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.mapCollidables.remove(this);
      this._super.apply(this, args);
      return this.mapCollidables.add(this);
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
    _replaceInMapCollidables: function() {
      return this.mapCollidables.add(this);
    },
    _initCollidableBounds: function() {
      return this.cbounds = game.Bounds.rect(0, 0, this.width, this.height - 8);
    },
    _initCollidables: function() {
      if (this.map.enableCollisions) {
        return this.mapCollidables = this.map.getObjectsWithout(this);
      } else {
        return this.mapCollidables = game.CollidableCollection.getEmpty();
      }
    }
  });

  game.Collidable = Collidable;

  window.scriptLoaded('app/collidable');

}).call(this);
