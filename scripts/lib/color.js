(function(window, document, $, _, undefined) {

  window.Color = function() {
    Color.init.apply(this, arguments);
  }
  Object.extend(Color, {
    init: function(color) {
      var self = this;
      self.red = color.red;
      self.green = color.green,
      self.blue = color.blue;
      self.hue = color.hue;
      self.saturation = color.saturation;
      self.lightness = color.lightness;
    },
    fromRGB: function(red, green, blue) {
      var color = new Color({red: red, green: green, blue: blue});
      color.refreshHSL();
      return color;
    },
    fromHSL: function(hue, saturation, lightness) {
      var color = new Color({hue: hue, saturation: saturation, lightness: lightness});
      color.refreshRGB();
      return color;
    },
    // This is basically a straight port of code in the SASS source
    rgb2hsl: function(rgb) {
      var self = this;
      var hsl = {};

      var r = rgb.red   / 255.0;
      var g = rgb.green / 255.0;
      var b = rgb.blue  / 255.0;

      // Algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Conversion_from_RGB_to_HSL_or_HSV
      var max = Math.max(r, g, b);
      var min = Math.min(r, g, b);
      var d   = max - min;

      var h;
      switch (max) {
        case min:
          h = 0;
          break;
        case r:
          h = 60 * (g-b) / d;
          break;
        case g:
          h = 60 * (b-r) / d + 120;
          break;
        case b:
          h = 60 * (r-g) / d + 240;
          break;
      }

      var l = (max + min) / 2.0;

      var s;
      if (max == min) {
        s = 0
      } else if (l < 0.5) {
        s = d / (2 * l);
      } else {
        s = d / (2 - 2*l);
      }

      hsl.hue = Math.round(h % 360);
      hsl.saturation = Math.round(s * 100);
      hsl.lightness = Math.round(l * 100);

      return hsl;
    },
    // This is basically a straight port of code in the SASS source
    hsl2rgb: function(hsl) {
      var self = this;
      var rgb = {};

      var h = hsl.hue / 360.0;
      var s = hsl.saturation / 100.0;
      var l = hsl.lightness / 100.0;

      // Algorithm from the CSS3 spec: http://www.w3.org/TR/css3-color/#hsl-color.
      var m2 = (l <= 0.5) ? (l * (s + 1)) : (l + s - (l * s));
      var m1 = (l * 2) - m2;
      rgb.red   = Math.round(self._hue2rgb(m1, m2, h + (1.0/3)) * 255);
      rgb.green = Math.round(self._hue2rgb(m1, m2, h) * 255);
      rgb.blue  = Math.round(self._hue2rgb(m1, m2, h - (1.0/3)) * 255);

      return rgb;
    },
    _hue2rgb: function(m1, m2, h) {
      if (h < 0) h++;
      if (h > 1) h--;
      if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
      if (h * 2 < 1) return m2;
      if (h * 3 < 2) return m1 + (m2 - m1) * (2.0/3 - h) * 6;
      return m1;
    }
  });
  Object.extend(Color.prototype, {
    refreshHSL: function() {
      var self = this;
      Object.extend(self, Color.rgb2hsl(self));
    },
    refreshRGB: function() {
      var self = this;
      Object.extend(self, Color.hsl2rgb(self));
    },
    clone: function() {
      var self = this;
      return new Color({
        red: self.red,
        green: self.green,
        blue: self.blue,
        hue: self.hue,
        saturation: self.saturation,
        lightness: self.lightness
      });
    },
    toRGBString: function() {
      var self = this;
      return [self.red, self.green, self.blue].join(",");
    },
    isEqual: function(other) {
      var self = this;
      return other && other.red == self.red && other.green == self.green && other.blue == self.blue;
    }
  })
  
})(window, window.document, window.$, window._);