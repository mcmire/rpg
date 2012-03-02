(function() {

  define('game.Image', function() {
    var Image, assignable, meta, simpleDrawable, _ref;
    meta = require('meta');
    _ref = require('roles'), assignable = _ref.assignable, simpleDrawable = _ref.simpleDrawable;
    Image = meta.def(assignable, simpleDrawable, {
      init: function(name, width, height) {
        var path;
        this.name = name;
        this.width = width;
        this.height = height;
        path = this.name;
        if (!/\.[^.]+$/.test(path)) path += ".gif";
        if (!/^\//.test(path)) path = require('common').resolveImagePath(path);
        this.path = path;
        return this.isLoaded = false;
      },
      getElement: function() {
        return this.element;
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
          if (typeof self.onLoadCallback === "function") self.onLoadCallback();
          return self.isLoaded = true;
        };
        return this.element.onerror = function() {
          throw new Error("Could not load image " + self.path + "!");
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
    return Image;
  });

}).call(this);
