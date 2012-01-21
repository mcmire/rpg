var __slice = Array.prototype.slice;

define(function(require) {
  var Bounds, canvas, fpsReporter, module, plug, viewport;
  module = require('app/meta').module;
  plug = require('app/plug');
  fpsReporter = require('app/fps_reporter');
  Bounds = require('app/bounds');
  canvas = require('app/canvas');
  viewport = module('game.viewport', plug('fpsReporter'), {
    width: 600,
    height: 400,
    playerPadding: 30,
    init: function(main) {
      this.main = main;
      this.bounds = Bounds.rect(0, 0, this.width, this.height);
      this.$element = $('<div id="viewport" />').css({
        width: this.width,
        height: this.height,
        'background-image': "url(" + main.imagesPath + "/map2x.png)",
        'background-repeat': 'no-repeat'
      });
      this.canvas = canvas.create(this.width, this.height);
      this.canvas.element.id = 'canvas';
      return this.$element.append(this.canvas.$element);
    },
    draw: function() {
      var bom, positionStr;
      bom = this.bounds;
      positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ");
      return this.$element.css('background-position', positionStr);
    },
    translate: function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_ref = this.bounds).translate.apply(_ref, args);
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
