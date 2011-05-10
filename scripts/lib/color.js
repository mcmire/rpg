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
  
    // Much of the code in the next three methods were stolen from <http://hslpicker.com>,
    // which in turn was adapted from the SASS source
    // which in turn was adapted from algorithms on <http://en.wikipedia.org/wiki/HSL_and_HSV>
    
    rgb2hsl: function(rgb) {
      var self = this;
      var hsl = {};
      
      var r = rgb.red   / 255;
      var g = rgb.green / 255;
      var b = rgb.blue  / 255;
      
      // Algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Conversion_from_RGB_to_HSL_or_HSV
      var max  = Math.max(r, g, b);
      var min  = Math.min(r, g, b);
      var diff = max - min;
      var sum  = min + max;
      
      var h;
      switch (max) {
        case min:
          h = null;
          break;
        case r:
          h = ((60 * (g - b) / diff) + 360) % 360;
          break;
        case g:
          h = (60 * (b - r) / diff) + 120;
          break;
        case b:
          h = (60 * (r - g) / diff) + 240;
          break;
      }
      
      var l = sum / 2;
      
      var s;
      if (l === 0) s = 0;
      else if (l === 1) s = 1;
      else if (l <= 0.5) s = diff / sum;
      else s = diff / (2 - sum);
      
      hsl.hue = h ? Math.round(h) : null;
      hsl.saturation = Math.round(s * 100);
      hsl.lightness = Math.round(l * 100);
      
      return hsl;
    },
    hsl2rgb: function(hsl) {
      var self = this;
      var rgb = {};
      
      var h = hsl.hue / 360;
          s = hsl.saturation / 100;
          l = hsl.lightness / 100;
      
      if (l <= 0.5) var q = l * (1 + s);
      else var q = l + s - (l * s);
     
      var p = 2 * l - q;
      var tr = h + (1 / 3);
      var tg = h;
      var tb = h - (1 / 3);
      
      // Algorithm from the CSS3 spec: http://www.w3.org/TR/css3-color/#hsl-color.
      rgb.red   = Math.round(self._hue2rgb(p, q, tr) * 255);
      rgb.green = Math.round(self._hue2rgb(p, q, tg) * 255);
      rgb.blue  = Math.round(self._hue2rgb(p, q, tb) * 255);
      
      return rgb;
    },
    _hue2rgb: function(p, q, h) {
      if (h < 0) h += 1;
      else if (h > 1) h -= 1;
       
      if ((h * 6) < 1) return p + (q - p) * h * 6;
      else if ((h * 2) < 1) return q;
      else if ((h * 3) < 2) return p + (q - p) * ((2 / 3) - h) * 6;
      else return p;
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
      return other && (
        other.red == self.red &&
        other.green == self.green &&
        other.blue == self.blue
      ) && (
        other.hue == self.hue &&
        other.saturation == self.saturation &&
        other.lightness == self.lightness
      );
    }
  })
  
})(window, window.document, window.$, window._);