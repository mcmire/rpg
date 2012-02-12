(function() {
  var Foreground, assignable, attachable, game, meta, tickable, _ref,
    __slice = Array.prototype.slice;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, attachable = _ref.attachable, assignable = _ref.assignable, tickable = _ref.tickable;

  Foreground = meta.def('game.Foreground', assignable, tickable, {
    init: function(map, width, height) {
      this.map = map;
      this.width = width;
      this.height = height;
      this.objects = game.CollidableCollection.create();
      this.grobs = [];
      this.blocks = [];
      this.player = null;
      return this.enableCollisions = true;
    },
    assignToViewport: function(viewport) {
      this.viewport = viewport;
    },
    addObject: function() {
      var positions, proto, self;
      proto = arguments[0], positions = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      self = this;
      return $.v.each(positions, function(_arg) {
        var height, object, width, x, y;
        x = _arg[0], y = _arg[1], width = _arg[2], height = _arg[3];
        object = proto.clone().assignToMap(self);
        object.setMapPosition(x, y);
        self.objects.push(object);
        if (game.StillObject.isPrototypeOf(object)) {
          return self.grobs.push(object);
        } else if (object.tick != null) {
          return self.blocks.push(object);
        }
      });
    },
    removeObject: function(object) {
      this.objects["delete"](object);
      return this.grobs["delete"](object);
    },
    addPlayer: function(player) {
      this.player = player;
      this.player.assignToMap(this);
      this.objects.push(this.player);
      return this.grobs.push(this.player);
    },
    removePlayer: function() {
      return this.removeObject(this.player);
    },
    onLoad: function(onLoadCallback) {
      this.onLoadCallback = onLoadCallback;
    },
    load: function() {
      var _ref2;
      this.$canvas = $('<canvas>').attr('width', this.width).attr('height', this.height).addClass('foreground');
      return (_ref2 = this.onLoadCallback) != null ? _ref2.call(this) : void 0;
    },
    unload: function() {
      this.$canvas = null;
      return this.ctx = null;
    },
    activate: function() {
      var grob, _i, _len, _ref2, _results;
      _ref2 = this.grobs;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        grob = _ref2[_i];
        _results.push(grob.activate());
      }
      return _results;
    },
    deactivate: function() {
      var grob, _i, _len, _ref2, _results;
      _ref2 = this.grobs;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        grob = _ref2[_i];
        _results.push(grob.deactivate());
      }
      return _results;
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
      var block, grob, _i, _j, _len, _len2, _ref2, _ref3, _results;
      this.$canvas.css({
        top: -this.viewport.bounds.y1,
        left: -this.viewport.bounds.x1
      });
      _ref2 = this.grobs;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        grob = _ref2[_i];
        grob.tick(this.ctx);
      }
      _ref3 = this.blocks;
      _results = [];
      for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
        block = _ref3[_j];
        _results.push(block.tick(this.ctx));
      }
      return _results;
    },
    getObjectsWithout: function(object) {
      return this.objects.without(object);
    }
  });

  Foreground.add = Foreground.addObject;

  Foreground.remove = Foreground.removeObject;

  game.Foreground = Foreground;

  window.scriptLoaded('app/foreground');

}).call(this);
