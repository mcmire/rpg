(function() {
  var enderMembers, _boundsCollide, _boundsFor;

  $._select('<div>');

  _boundsFor = function(offset) {
    return {
      x1: offset.left,
      x2: offset.left + offset.width,
      y1: offset.top,
      y2: offset.top + offset.height
    };
  };

  _boundsCollide = function(b1, b2) {
    var x1i, x2i, xo, y1i, y2i, yo, _ref, _ref2, _ref3, _ref4;
    x1i = (b2.x1 < (_ref = b1.x1) && _ref < b2.x2);
    x2i = (b2.x1 < (_ref2 = b1.x2) && _ref2 < b2.x2);
    xo = b1.x1 <= b2.x1 && b1.x2 >= b2.x2;
    y1i = (b2.y1 < (_ref3 = b1.y1) && _ref3 < b2.y2);
    y2i = (b2.y1 < (_ref4 = b1.y2) && _ref4 < b2.y2);
    yo = b1.y1 <= b2.y1 && b1.y2 >= b2.y2;
    return (x1i || x2i || xo) && (y1i || y2i || yo);
  };

  enderMembers = {
    collidesWith: function($element) {
      var eo, to;
      to = this.offset();
      eo = $element.offset();
      return _boundsCollide(to, eo);
    }
  };

  $.ender(enderMembers, true);

}).call(this);
