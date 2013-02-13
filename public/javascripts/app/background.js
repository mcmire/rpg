(function() {
  var Background, SortedObjectMatrix, assignable, attachable, game, meta, tickable, _ref,
    __slice = [].slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, attachable = _ref.attachable, assignable = _ref.assignable, tickable = _ref.tickable;

  SortedObjectMatrix = game.SortedObjectMatrix;

  Background = meta.def('game.Background', assignable, tickable, {
    init: function(map, width, height) {
      this.map = map;
      this.width = width;
      this.height = height;
      this.fills = [];
      this.tiles = [];
      this.sprites = game.SortedObjectMatrix.create();
      return this.framedSprites = this.sprites.clone().extend(game.FramedObjectMatrix);
    },
    assignToViewport: function(viewport) {
      this.viewport = viewport;
      return this.framedSprites.frameWithin(this.viewport.bounds);
    },
    fill: function(color, pos, dims) {
      return this.fills.push([color, pos, dims]);
    },
    addTile: function() {
      var opts, positions, proto, self;
      proto = arguments[0], positions = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      self = this;
      opts = {};
      if ($.v.is.obj(positions[positions.length - 1])) {
        opts = positions.pop();
      }
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
      var color, ctx, height, tile, width, x1, y1, _i, _j, _len, _len1, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
      this.$canvas = $('<canvas>').attr('width', this.width).attr('height', this.height).addClass('background');
      ctx = this.$canvas[0].getContext('2d');
      _ref1 = this.fills;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        _ref2 = _ref1[_i], color = _ref2[0], (_ref3 = _ref2[1], x1 = _ref3[0], y1 = _ref3[1]), (_ref4 = _ref2[2], width = _ref4[0], height = _ref4[1]);
        ctx.fillStyle = color;
        ctx.fillRect(x1, y1, width, height);
      }
      _ref5 = this.tiles;
      _results = [];
      for (_j = 0, _len1 = _ref5.length; _j < _len1; _j++) {
        tile = _ref5[_j];
        _results.push(tile.draw(ctx));
      }
      return _results;
    },
    unload: function() {
      this.$canvas = null;
      return this.ctx = null;
    },
    attachTo: function(viewport) {
      this.viewport = viewport;
      this.viewport.$element.append(this.$canvas);
      return this.ctx = this.$canvas[0].getContext('2d');
    },
    detach: function() {
      return this.$canvas.detach();
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
    }
  });

  Background.add = Background.addTile;

  game.Background = Background;

  window.scriptLoaded('app/background');

}).call(this);
