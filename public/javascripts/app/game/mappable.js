(function() {
  var Mappable, common, game, meta,
    __slice = Array.prototype.slice;

  common = (window.common || (window.common = {}));

  game = (window.game || (window.game = {}));

  meta = common.meta;

  Mappable = meta.def('game.Mappable', {
    init: function(width, height) {
      this.width = width;
      this.height = height;
      this._initMappableBounds();
      this._initPrevMappableBounds();
      return this;
    },
    assignToMap: function(map) {
      this.assignTo(map);
      this.map = map;
      this.viewport = this.map.viewport;
      return this;
    },
    doToMapBounds: function() {
      var args, methodName, _ref;
      methodName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return (_ref = this.mbounds)[methodName].apply(_ref, args);
    },
    setMapPosition: function(x, y) {
      return this.doToMapBounds('anchor', x, y);
    },
    recalculateViewportBounds: function() {
      var x1, y1;
      x1 = this.mbounds.x1 - this.viewport.bounds.x1;
      y1 = this.mbounds.y1 - this.viewport.bounds.y1;
      return this.vbounds.anchor(x1, y1);
    },
    inspect: function() {
      return JSON.stringify({
        "vbounds": this.vbounds.inspect(),
        "mbounds": this.mbounds.inspect()
      });
    },
    debug: function() {
      console.log("vbounds = " + (this.vbounds.inspect()));
      return console.log("mbounds = " + (this.mbounds.inspect()));
    },
    _initMappableBounds: function() {
      this._initBoundsOnMap();
      return this._initBoundsInViewport();
    },
    _initPrevMappableBounds: function() {
      this.prev = {};
      this.prev.mbounds = this.mbounds;
      return this.prev.vbounds = this.vbounds;
    },
    _initBoundsOnMap: function() {
      return this.mbounds = game.Bounds.rect(0, 0, this.width, this.height);
    },
    _initBoundsInViewport: function() {
      return this.vbounds = game.Bounds.rect(0, 0, this.width, this.height);
    }
  });

  game.Mappable = Mappable;

}).call(this);
