(function() {
  var Bounds, game,
    __slice = Array.prototype.slice;

  game = window.game;

  Bounds = (function() {

    function Bounds(width, height, x1, y1) {
      this.width = width;
      this.height = height;
      if (x1 == null) x1 = 0;
      if (y1 == null) y1 = 0;
      this.x1 = x1 != null ? x1 : 0;
      this.x2 = typeof x2 !== "undefined" && x2 !== null ? x2 : this.x1 + this.width;
      this.y1 = y1 != null ? y1 : 0;
      this.y2 = typeof y2 !== "undefined" && y2 !== null ? y2 : this.y1 + this.height;
    }

    Bounds.prototype.withTranslation = function() {
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
    };

    Bounds.prototype.withScale = function(amount) {
      var bounds;
      bounds = this.clone();
      bounds.x1 = this.x1 + amount;
      bounds.x2 = this.x2 - amount;
      bounds.y1 = this.y1 + amount;
      bounds.y2 = this.y2 - amount;
      bounds.width = this.width - (amount * 2);
      bounds.height = this.height - (amount * 2);
      return bounds;
    };

    Bounds.prototype.translate = function() {
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
    };

    Bounds.prototype.translateBySide = function(side, value) {
      var axis, diff, oldValue, otherSide, si, si_;
      axis = side[0], si = side[1];
      si_ = si === "2" ? 1 : 2;
      otherSide = axis + si_;
      oldValue = this[side];
      diff = value - oldValue;
      this[side] = value;
      this[otherSide] += diff;
      return diff;
    };

    Bounds.prototype.anchor = function(x1, y1) {
      this.x1 = x1;
      this.x2 = x1 + this.width;
      this.y1 = y1;
      this.y2 = y1 + this.height;
      return this;
    };

    Bounds.prototype.offsetToKeepInside = function(direction, bounds) {
      switch (direction) {
        case 'left':
          return this.x1 - bounds.x1;
        case 'right':
          return bounds.x2 - this.x2;
        case 'up':
          return bounds.y2 - this.y2;
        case 'down':
          return this.y1 - bounds.y1;
      }
    };

    Bounds.prototype.clone = function() {
      return new Bounds(this.width, this.height, this.x1, this.y1);
    };

    Bounds.prototype.inspect = function() {
      return "(" + this.x1 + ".." + this.x2 + ", " + this.y1 + ".." + this.y2 + ")";
    };

    return Bounds;

  })();

  game.Bounds = Bounds;

}).call(this);
