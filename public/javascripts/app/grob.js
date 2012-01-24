
define(function(require) {
  var Bounds, Class, Grob, drawable, loadable, module, tickable, _boundsFrom, _ref, _ref2;
  _ref = require('app/meta'), Class = _ref.Class, module = _ref.module;
  _ref2 = require('app/roles'), loadable = _ref2.loadable, tickable = _ref2.tickable, drawable = _ref2.drawable;
  Bounds = require('app/bounds');
  _boundsFrom = function(boundsOrGrob) {
    if (boundsOrGrob instanceof Grob) {
      return boundsOrGrob.bounds.onMap;
    } else {
      return boundsOrGrob;
    }
  };
  Grob = Class.extend('game.Grob', loadable, tickable, drawable, {
    init: function(core) {
      var _ref3;
      this.core = core;
      _ref3 = this.core, this.viewport = _ref3.viewport, this.collisionLayer = _ref3.collisionLayer;
      this._initDims();
      return this.reset();
    },
    reset: function() {
      this._initBounds();
      this._initLastBounds();
      return this._initCollisionLayer();
    },
    _initDims: function() {
      throw new Error('must be overridden');
    },
    _initBounds: function() {
      this.bounds = {};
      this._initBoundsOnMap();
      return this._initBoundsInViewport();
    },
    _initLastBounds: function() {
      this.lastBounds = {};
      this.lastBounds.onMap = this.bounds.onMap;
      return this.lastBounds.inViewport = this.bounds.inViewport;
    },
    _initBoundsOnMap: function() {
      return this.bounds.onMap = Bounds.rect(0, 0, this.width, this.height);
    },
    _initBoundsInViewport: function() {
      this.bounds.inViewport = Bounds.rect(0, 0, this.width, this.height);
      return this._recalculateViewportBounds();
    },
    _recalculateViewportBounds: function() {
      var x1, y1;
      x1 = this.bounds.onMap.x1 - this.viewport.bounds.x1;
      y1 = this.bounds.onMap.y1 - this.viewport.bounds.y1;
      return this.bounds.inViewport.anchor(x1, y1);
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
    },
    inspect: function() {
      return JSON.stringify({
        "bounds.inViewport": this.bounds.inViewport.inspect(),
        "bounds.onMap": this.bounds.onMap.inspect()
      });
    },
    debug: function() {
      console.log("bounds.inViewport = " + (this.bounds.inViewport.inspect()));
      return console.log("bounds.OnMap = " + (this.bounds.onMap.inspect()));
    }
  });
  return Grob;
});
