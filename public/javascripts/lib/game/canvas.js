(function() {
  var Canvas, game;
  game = window.game;
  Canvas = game.util.module("game.Canvas");
  $.extend(Canvas, {
    create: function(width, height, callback) {
      var c;
      c = {};
      c.$element = $("<canvas/>");
      c.element = c.$element[0];
      c.ctx = c.element.getContext("2d");
      $.extend(c.ctx, Canvas.Context);
      c.width = c.element.width = width;
      c.height = c.element.height = height;
      if (callback) {
        callback(c);
      }
      return c;
    },
    Context: {
      getImageData: function(x, y, width, height) {
        var imageData;
        imageData = this._super.call(this, x, y, width, height);
        $.extend(imageData, Canvas.ImageData);
        return imageData;
      },
      createImageData: function(width, height) {
        var imageData;
        imageData = this._super.call(this, width, height);
        $.extend(imageData, Canvas.ImageData);
        return imageData;
      }
    },
    ImageData: {
      getPixel: function(x, y) {
        var index;
        index = (x + y * this.width) * 4;
        return {
          red: this.data[index + 0],
          green: this.data[index + 1],
          blue: this.data[index + 2],
          alpha: this.data[index + 3]
        };
      },
      setPixel: function(x, y, r, g, b, a) {
        var index;
        index = (x + y * this.width) * 4;
        this.data[index + 0] = r;
        this.data[index + 1] = g;
        this.data[index + 2] = b;
        return this.data[index + 3] = a;
      }
    }
  });
}).call(this);
