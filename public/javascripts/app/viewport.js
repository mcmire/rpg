var __slice = Array.prototype.slice;

define(function(require) {
  var Bounds, attachable, canvas, module, tickable, viewport, _ref;
  module = require('app/meta').module;
  _ref = require('app/roles'), attachable = _ref.attachable, tickable = _ref.tickable;
  Bounds = require('app/bounds');
  canvas = require('app/canvas');
  viewport = module('game.viewport', attachable, tickable, {
    width: 600,
    height: 400,
    playerPadding: 30,
    init: function(core) {
      this.core = core;
      this.main = this.core.main;
      this._super(this.core);
      this.bounds = Bounds.rect(0, 0, this.width, this.height);
      this.$element = $('<div id="viewport" />').css({
        width: this.width,
        height: this.height,
        'background-image': "url(" + this.core.imagesPath + "/map2x.png)",
        'background-repeat': 'no-repeat'
      });
      return this.canvas = canvas.create(this.$element, 'canvas', this.width, this.height);
    },
    attach: function() {
      this.$element.appendTo(this.main.$element);
      return this.canvas.attach();
    },
    tick: function() {
      return this.draw();
    },
    draw: function() {
      var bom, positionStr;
      bom = this.bounds;
      positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ");
      return this.$element.css('background-position', positionStr);
    },
    translate: function() {
      var args, _ref2;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_ref2 = this.bounds).translate.apply(_ref2, args);
      return this;
    },
    translateBySide: function(side, value) {
      return this.bounds.translateBySide(side, value);
    },
    inspect: function() {
      return JSON.stringify({
        "bounds": this.bounds.inspect()
      });
    },
    debug: function() {
      console.log("viewport.frame.bounds = (" + this.frame.bounds.x1 + ".." + this.frame.bounds.x2 + ", " + this.frame.bounds.y1 + ".." + this.frame.bounds.y2 + ")");
      return console.log("viewport.padding.bounds = (" + this.padding.bounds.x1 + ".." + this.padding.bounds.x2 + ", " + this.padding.bounds.y1 + ".." + this.padding.bounds.y2 + ")");
    }
  });
  return viewport;
});
