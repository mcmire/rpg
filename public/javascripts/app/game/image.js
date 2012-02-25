(function() {
  var game;

  (game = this.game).define('Image', function(name) {
    var Image;
    Image = this.meta.def(name, this.roles.assignable, this.roles.simpleDrawable, {
      init: function(path, width, height) {
        this.width = width;
        this.height = height;
        this.path = path;
        if (!/\.[^.]+$/.test(this.path)) this.path += ".gif";
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
          if (typeof self.onLoadCallback === "function") self.onLoadCallback();
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
    return Image;
  });

}).call(this);
