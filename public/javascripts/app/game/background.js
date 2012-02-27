(function() {
  var Background, SortedObjectMatrix, assignable, attachable, common, game, meta, tickable, _ref,
    __slice = Array.prototype.slice;

  common = (window.common || (window.common = {}));

  meta = common.meta;

  _ref = common.roles, attachable = _ref.attachable, assignable = _ref.assignable, tickable = _ref.tickable;

  game = (window.game || (window.game = {}));

  SortedObjectMatrix = game.SortedObjectMatrix;

  Background = meta.def('game.Background', attachable, assignable, tickable, {
    init: function(map, width, height) {
      this.map = map;
      this.width = width;
      this.height = height;
      this.fills = [];
      this.tiles = [];
      this.sprites = game.SortedObjectMatrix.create();
      return this.framedSprites = this.sprites.clone().extend(game.FramedObjectMatrix);
    },
    setParent: function(parent) {
      this._super(parent);
      this.viewport = parent;
      return this.framedSprites.frameWithin(this.viewport.bounds);
    },
    attach: function() {
      this._super();
      return this.ctx = this.$canvas[0].getContext('2d');
    },
    tick: function() {
      var self;
      self = this;
      this.$canvas.css({
        top: -this.viewport.bounds.y1,
        left: -this.viewport.bounds.x1
      });
      return this.framedSprites.each(function(sprite) {
        return sprite.draw(self.ctx);
      });
    },
    fill: function(color, pos, dims) {
      return this.fills.push([color, pos, dims]);
    },
    addTile: function() {
      var opts, positions, proto, self;
      proto = arguments[0], positions = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      self = this;
      opts = {};
      if ($.v.is.obj(positions[positions.length - 1])) opts = positions.pop();
      return $.v.each(positions, function(_arg) {
        var object, tile, x, y;
        x = _arg[0], y = _arg[1];
        object = proto.clone().extend(opts);
        tile = game.MapTile.create(object).assignToMap(this);
        tile.setMapPosition(x, y);
        self.tiles.push(tile);
        if (game.ImageSequence.isPrototypeOf(proto)) {
          return self.sprites.push(tile);
        }
      });
    },
    load: function() {
      var color, ctx, height, tile, width, x1, y1, _i, _j, _len, _len2, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
      this.$canvas = $('<canvas>').attr('width', this.width).attr('height', this.height).addClass('background');
      this.setElement(this.$canvas);
      ctx = this.$canvas[0].getContext('2d');
      _ref2 = this.fills;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        _ref3 = _ref2[_i], color = _ref3[0], (_ref4 = _ref3[1], x1 = _ref4[0], y1 = _ref4[1]), (_ref5 = _ref3[2], width = _ref5[0], height = _ref5[1]);
        ctx.fillStyle = color;
        ctx.fillRect(x1, y1, width, height);
      }
      _ref6 = this.tiles;
      _results = [];
      for (_j = 0, _len2 = _ref6.length; _j < _len2; _j++) {
        tile = _ref6[_j];
        _results.push(tile.draw(ctx));
      }
      return _results;
    },
    unload: function() {
      this.$canvas = null;
      this.clearElement();
      return this.ctx = null;
    }
  });

  Background.add = Background.addTile;

  game.Background = Background;

}).call(this);
