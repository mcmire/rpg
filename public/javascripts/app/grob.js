
define(function(require) {
  var Bounds, Class, CollidableBox, Grob, drawable, loadable, module, tickable, _ref, _ref2;
  _ref = require('app/meta'), Class = _ref.Class, module = _ref.module;
  _ref2 = require('app/roles'), loadable = _ref2.loadable, tickable = _ref2.tickable, drawable = _ref2.drawable;
  Bounds = require('app/bounds');
  CollidableBox = require('app/collision_layer').CollidableBox;
  Grob = Class.extend('game.Grob', loadable, tickable, drawable, {
    init: function(main) {
      var _ref3;
      this.main = main;
      _ref3 = this.main, this.viewport = _ref3.viewport, this.map = _ref3.map, this.collisionLayer = _ref3.collisionLayer;
      this.isLoaded = false;
      this.ctx = this.viewport.canvas.ctx;
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
    _initCollisionLayer: function() {
      return this.box = new CollidableBox(this.bounds.onMap);
    },
    load: function() {
      return this.isLoaded = true;
    },
    tick: function() {
      this.predraw();
      this.draw();
      return this.postdraw();
    },
    predraw: function() {
      var lbiv;
      lbiv = this.lastBounds.inViewport;
      return this.ctx.clearRect(lbiv.x1, lbiv.y1, this.width, this.height);
    },
    draw: function() {
      var biv;
      biv = this.bounds.inViewport;
      this.ctx.save();
      this.ctx.strokeStyle = '#ff0000';
      this.ctx.strokeRect(biv.x1, biv.y1, this.width, this.height);
      return this.ctx.restore();
    },
    postdraw: function() {
      return this.lastBounds.inViewport = this.bounds.inViewport.clone();
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
