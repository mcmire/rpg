(function() {
  var __slice = Array.prototype.slice;

  define('game.canvas', function() {
    var Pixel, canvas, contextExt, imageDataExt;
    Pixel = (function() {

      function Pixel(x, y, red, green, blue, alpha) {
        this.x = x;
        this.y = y;
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
      }

      Pixel.prototype.isFilled = function() {
        return this.red || this.green || this.blue || this.alpha;
      };

      Pixel.prototype.isTransparent = function() {
        return !this.isFilled();
      };

      return Pixel;

    })();
    contextExt = {
      extend: function(ctx) {
        var createImageData, getImageData;
        getImageData = ctx.getImageData;
        createImageData = ctx.createImageData;
        return $.extend(ctx, {
          getImageData: function(x, y, width, height) {
            var imageData;
            imageData = getImageData.apply(this, arguments);
            imageDataExt.extend(imageData);
            return imageData;
          },
          createImageData: function(width, height) {
            var imageData;
            imageData = createImageData.apply(this, arguments);
            imageDataExt.extend(imageData);
            return imageData;
          }
        });
      }
    };
    imageDataExt = {
      extend: function(imageData) {
        return $.extend(imageData, {
          getPixel: function(x, y) {
            var data, i;
            i = (x + y * this.width) * 4;
            data = this.data;
            return {
              red: data[i + 0],
              green: data[i + 1],
              blue: data[i + 2],
              alpha: data[i + 3]
            };
          },
          setPixel: function(x, y, r, g, b, a) {
            var i;
            if (a == null) a = 255;
            i = (x + (y * this.width)) * 4;
            this.data[i + 0] = r;
            this.data[i + 1] = g;
            this.data[i + 2] = b;
            return this.data[i + 3] = a;
          },
          each: function(fn) {
            var a, b, data, g, i, len, pi, pixel, r, x, y, _ref, _ref2, _results;
            data = this.data;
            _ref = [0, data.length], i = _ref[0], len = _ref[1];
            _results = [];
            while (i < len) {
              _ref2 = [data[i], data[i + 1], data[i + 2], data[i + 3]], r = _ref2[0], g = _ref2[1], b = _ref2[2], a = _ref2[3];
              pi = Math.floor(i / 4);
              y = Math.floor(pi / this.width);
              x = pi - (y * this.width);
              pixel = new Pixel(x, y, r, g, b, a);
              fn(pixel);
              _results.push(i += 4);
            }
            return _results;
          }
        });
      }
    };
    canvas = {
      create: function() {
        var $element, args, c, height, id, parent, width, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _ref = args.reverse(), height = _ref[0], width = _ref[1], id = _ref[2], parent = _ref[3];
        $element = $("<canvas/>").attr('width', width).attr('height', height);
        if (id) $element.attr('id', id);
        c = {};
        c.width = width;
        c.height = height;
        c.$element = $element;
        c.element = c.$element[0];
        c.getContext = function() {
          var ctx;
          ctx = this.element.getContext("2d");
          return ctx;
        };
        c.attach = function() {
          this.$element.appendTo(parent);
          this.element = this.$element[0];
          return this;
        };
        c.appendTo = function(parent) {
          this.$element.appendTo(parent);
          this.element = this.$element[0];
          return this;
        };
        return c;
      }
    };
    return canvas;
  });

}).call(this);
