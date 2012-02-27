(function() {
  var Bounds, common, game, meta, _boundsFrom,
    __slice = Array.prototype.slice;

  common = (window.common || (window.common = {}));

  game = (window.game || (window.game = {}));

  meta = common.meta;

  _boundsFrom = function(mappableOrBounds) {
    var _ref;
    return (_ref = mappableOrBounds.mbounds) != null ? _ref : mappableOrBounds;
  };

  Bounds = meta.def('game.Bounds', {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    width: 0,
    height: 0,
    rect: function(x1, y1, width, height) {
      var bounds;
      bounds = this.clone();
      bounds.x1 = x1;
      bounds.y1 = y1;
      bounds.width = width;
      bounds.height = height;
      bounds._calculateBottomRightCorner();
      return bounds;
    },
    at: function(x1, y1, x2, y2) {
      var bounds;
      bounds = this.clone();
      bounds.x1 = x1;
      bounds.y1 = y1;
      bounds.x2 = x2;
      bounds.y2 = y2;
      bounds._calculateWidthAndHeight();
      return bounds;
    },
    withTranslation: function() {
      var args, bounds, x, y, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1 && $.is.obj(args[0])) {
        _ref = args[0], x = _ref.x, y = _ref.y;
      } else {
        x = args[0], y = args[1];
      }
      bounds = this.clone();
      if (x != null) {
        bounds.x1 += x;
        bounds.x2 += x;
      }
      if (y != null) {
        bounds.y1 += y;
        bounds.y2 += y;
      }
      return bounds;
    },
    withScale: function(amount) {
      var bounds;
      bounds = this.clone();
      bounds.x1 = this.x1 + amount;
      bounds.x2 = this.x2 - amount;
      bounds.y1 = this.y1 + amount;
      bounds.y2 = this.y2 - amount;
      bounds.width = this.width - (amount * 2);
      bounds.height = this.height - (amount * 2);
      return bounds;
    },
    translate: function() {
      var args, vec;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 2) {
        vec = {};
        vec[args[0]] = args[1];
      } else {
        vec = args[0];
      }
      if (vec.x != null) {
        this.x1 += vec.x;
        this.x2 += vec.x;
      }
      if (vec.y != null) {
        this.y1 += vec.y;
        this.y2 += vec.y;
      }
      return this;
    },
    translateBySide: function(side, value) {
      var axis, diff, oldValue, otherSide, si, si_;
      axis = side[0], si = side[1];
      si_ = si === "2" ? 1 : 2;
      otherSide = axis + si_;
      oldValue = this[side];
      diff = value - oldValue;
      this[side] = value;
      this[otherSide] += diff;
      return diff;
    },
    anchor: function(x1, y1) {
      this.x1 = x1;
      this.x2 = x1 + this.width;
      this.y1 = y1;
      this.y2 = y1 + this.height;
      return this;
    },
    withAnchor: function(x1, y1) {
      return this.clone().anchor(x1, y1);
    },
    replace: function(bounds) {
      this.width = bounds.width;
      this.height = bounds.height;
      this.x1 = bounds.x1;
      this.x2 = bounds.x2;
      this.y1 = bounds.y1;
      this.y2 = bounds.y2;
      return this;
    },
    intersectWith: function(other) {
      var x1i, x2i, xo, y1i, y2i, yo, _ref, _ref2, _ref3, _ref4;
      other = _boundsFrom(other);
      x1i = (other.x1 < (_ref = this.x1) && _ref < other.x2);
      x2i = (other.x1 < (_ref2 = this.x2) && _ref2 < other.x2);
      xo = this.x1 <= other.x1 && this.x2 >= other.x2;
      y1i = (other.y1 < (_ref3 = this.y1) && _ref3 < other.y2);
      y2i = (other.y1 < (_ref4 = this.y2) && _ref4 < other.y2);
      yo = this.y1 <= other.y1 && this.y2 >= other.y2;
      return (x1i || x2i || xo) && (y1i || y2i || yo);
    },
    getOuterLeftEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (this.intersectsWith(other)) return this.x1;
    },
    getOuterRightEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (this.intersectsWith(other)) return this.x2;
    },
    getOuterTopEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (this.intersectsWith(other)) return this.y1;
    },
    getOuterBottomEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (this.intersectsWith(other)) return this.y2;
    },
    doesContain: function(other) {
      other = _boundsFrom(other);
      return (other.x2 > this.x1 && other.x1 < this.x2) || (other.y2 > this.y1 && other.y1 < this.y2);
    },
    getInnerLeftEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (other.x1 < this.x1) return this.x1;
    },
    getInnerRightEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (other.x2 > this.x2) return this.x2;
    },
    getInnerTopEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (other.y1 < this.y1) return this.y1;
    },
    getInnerBottomEdgeBlocking: function(other) {
      other = _boundsFrom(other);
      if (other.y2 > this.y2) return this.y2;
    },
    draw: function(main) {
      var ctx;
      ctx = main.viewport.canvas.ctx;
      return ctx.strokeRect(this.x1 - 0.5, this.y1 - 0.5, this.width, this.height);
    },
    inspect: function() {
      return "(" + this.x1 + "," + this.y1 + ") to (" + this.x2 + "," + this.y2 + "), " + this.width + "x" + this.height;
    },
    _calculateBottomRightCorner: function() {
      this.x2 = this.x1 + this.width;
      return this.y2 = this.y1 + this.height;
    },
    _calculateWidthAndHeight: function() {
      this.width = this.x2 - this.x1;
      return this.height = this.y2 - this.y1;
    }
  });

  Bounds.intersectsWith = Bounds.intersectWith;

  game.Bounds = Bounds;

}).call(this);
