(function() {
  var Image, assignable, game, meta, simpleDrawable, _ref;

  game = (window.game || (window.game = {}));

  meta = game.meta2;

  _ref = game.roles, assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;

  Image = meta.def('game.Image', assignable, simpleDrawable, {
    init: function(path, width, height) {
      this.width = width;
      this.height = height;
      this.path = path;
      if (!/\.[^.]+$/.test(this.path)) {
        this.path += ".gif";
      }
      if (!/^\//.test(this.path)) {
        this.path = game.main.resolveImagePath(this.path);
      }
      return this.isLoaded = false;
    },
    load: function() {
      var self;
      self = this;
      this.element = document.createElement('img');
      this.element.width = this.width;
      this.element.height = this.height;
      this.element.src = this.path;
      this.element.onload = function() {
        console.log("Loaded " + self.path);
        if (typeof self.onLoadCallback === "function") {
          self.onLoadCallback();
        }
        return self.isLoaded = true;
      };
      return this.element.onerror = function() {
        return raise(new Error("Could not load image " + self.path + "!"));
      };
    },
    onLoad: function(fn) {
      return this.onLoadCallback = fn;
    },
    clear: function(ctx, x, y) {
      return ctx.clearRect(x, y, this.width, this.height);
    },
    draw: function(ctx, x, y) {
      return ctx.drawImage(this.element, x, y);
    }
  });

  game.Image = Image;

  window.scriptLoaded('app/image');

}).call(this);
