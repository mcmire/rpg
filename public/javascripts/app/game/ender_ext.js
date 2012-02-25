(function() {

  (function() {
    var enderMembers;
    enderMembers = {
      center: function() {
        var left, top, vp;
        vp = $.viewport();
        top = (vp.height / 2) - (this.height() / 2);
        left = (vp.width / 2) - (this.width() / 2);
        this.css("top", top + "px").css("left", left + "px");
        return this;
      },
      position: function() {
        var o, p, po;
        if (p = this.parent()) {
          po = p.offset();
          o = this.offset();
          return {
            top: o.top - po.top,
            left: o.left - po.left
          };
        } else {
          return {
            top: 0,
            left: 0
          };
        }
      },
      parent: function() {
        if (this[0].parentNode) return $(this[0].parentNode);
      },
      computedStyle: function(prop) {
        var computedStyle, elem, _ref;
        elem = this[0];
        computedStyle = (_ref = elem.currentStyle) != null ? _ref : document.defaultView.getComputedStyle(elem, null);
        return prop && computedStyle[prop] || computedStyle;
      }
    };
    return $.ender(enderMembers, true);
  })();

  window.scriptLoaded('app/ender_ext');

}).call(this);
