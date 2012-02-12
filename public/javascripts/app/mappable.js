(function() {
  var Mappable, game, meta;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

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
    setMapPosition: function(x, y) {
      return this.mbounds.anchor(x, y);
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

  window.scriptLoaded('app/mappable');

}).call(this);
