(function() {
  var Bounds, Canvas, EventHelpers, game, viewport, _ref,
    __slice = Array.prototype.slice;

  _ref = game = window.game, EventHelpers = _ref.EventHelpers, Canvas = _ref.Canvas, Bounds = _ref.Bounds;

  viewport = game.util.module("game.viewport", [EventHelpers]);

  viewport.playerPadding = 30;

  viewport.init = function(main) {
    this.main = main;
    if (!this.isInit) {
      this.width = this.main.dim(600, 'pixels');
      this.height = this.main.dim(400, 'pixels');
      this.bounds = Bounds.fromDims(this.width.pixels, this.height.pixels);
      this.$element = $('<div id="viewport" />').css({
        width: this.width.pixels,
        height: this.height.pixels,
        'background-image': "url(" + this.main.imagesPath + "/map2x.png)",
        'background-repeat': 'no-repeat'
      });
      this.canvas = Canvas.create(this.width.pixels, this.height.pixels);
      this.canvas.element.id = 'canvas';
      this.$element.append(this.canvas.$element);
      this.isInit = true;
    }
    return this;
  };

  viewport.destroy = function() {
    if (this.isInit) {
      this.reset();
      this.isInit = false;
    }
    return this;
  };

  viewport.attachTo = function(element) {
    return $(element).append(this.$element);
  };

  viewport.detach = function() {
    return this.$element.detach();
  };

  viewport.draw = function() {
    var bom, positionStr;
    bom = this.bounds;
    positionStr = [-bom.x1 + 'px', -bom.y1 + 'px'].join(" ");
    return this.$element.css('background-position', positionStr);
  };

  viewport.translate = function() {
    var args, _ref2;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    (_ref2 = this.bounds).translate.apply(_ref2, args);
    return this;
  };

  viewport.translateBySide = function(side, value) {
    return this.bounds.translateBySide(side, value);
  };

  viewport.inspect = function() {
    return JSON.stringify({
      "bounds": this.bounds.inspect()
    });
  };

  viewport.debug = function() {
    console.log("viewport.frame.bounds = (" + this.frame.bounds.x1 + ".." + this.frame.bounds.x2 + ", " + this.frame.bounds.y1 + ".." + this.frame.bounds.y2 + ")");
    return console.log("viewport.padding.bounds = (" + this.padding.bounds.x1 + ".." + this.padding.bounds.x2 + ", " + this.padding.bounds.y1 + ".." + this.padding.bounds.y2 + ")");
  };

}).call(this);
