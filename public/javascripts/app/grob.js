
define(function(require) {
  var Bounds, Grob, Mappable, Sprite, meta, _boundsFrom;
  meta = require('app/meta2');
  Sprite = require('app/sprite');
  Mappable = require('app/mappable');
  Bounds = require('app/bounds');
  _boundsFrom = function(boundsOrGrob) {
    if (boundsOrGrob instanceof Grob) {
      return boundsOrGrob.bounds.onMap;
    } else {
      return boundsOrGrob;
    }
  };
  Grob = meta.def('game.Grob', Sprite, Mappable, {
    init: function(core) {
      var _ref;
      this.core = core;
      this._super();
      _ref = this.core, this.viewport = _ref.viewport, this.collisionLayer = _ref.collisionLayer;
      return this._initCollisionLayer();
    },
    _initCollisionLayer: function() {},
    load: function() {
      return this.isLoaded = true;
    },
    tick: function() {
      this.predraw();
      this.draw();
      return this.postdraw();
    },
    predraw: function() {
      var ctx, lbiv;
      lbiv = this.lastBounds.inViewport;
      ctx = this.viewport.canvas.ctx;
      return ctx.clearRect(lbiv.x1, lbiv.y1, this.width, this.height);
    },
    draw: function() {
      var biv, ctx;
      biv = this.bounds.inViewport;
      ctx = this.viewport.canvas.ctx;
      ctx.save();
      ctx.strokeStyle = '#ff0000';
      ctx.strokeRect(biv.x1, biv.y1, this.width, this.height);
      return ctx.restore();
    },
    postdraw: function() {
      return this.lastBounds.inViewport = this.bounds.inViewport.clone();
    },
    intersectsWith: function(boundsOrGrob) {
      var bounds;
      bounds = _boundsFrom(boundsOrGrob);
      return this.bounds.onMap.intersectsWith(bounds);
    },
    getOuterLeftEdgeBlocking: function(boundsOrGrob) {
      var bounds;
      bounds = _boundsFrom(boundsOrGrob);
      return this.bounds.onMap.getOuterLeftEdgeBlocking(bounds);
    },
    getOuterRightEdgeBlocking: function(boundsOrGrob) {
      var bounds;
      bounds = _boundsFrom(boundsOrGrob);
      return this.bounds.onMap.getOuterRightEdgeBlocking(bounds);
    },
    getOuterTopEdgeBlocking: function(boundsOrGrob) {
      var bounds;
      bounds = _boundsFrom(boundsOrGrob);
      return this.bounds.onMap.getOuterTopEdgeBlocking(bounds);
    },
    getOuterBottomEdgeBlocking: function(boundsOrGrob) {
      var bounds;
      bounds = _boundsFrom(boundsOrGrob);
      return this.bounds.onMap.getOuterBottomEdgeBlocking(bounds);
    }
  });
  return Grob;
});
