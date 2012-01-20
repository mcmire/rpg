(function() {
  var enderMembers,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty;

  $.ender({
    extend: function() {
      var args, deep, obj, objects, prop, target, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (typeof args[0] === 'boolean') {
        deep = args.shift();
      } else {
        deep = true;
      }
      target = args.shift();
      objects = args;
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        obj = objects[_i];
        for (prop in obj) {
          if (!__hasProp.call(obj, prop)) continue;
          if (deep) {
            if ($.v.is.obj(obj[prop])) {
              target[prop] = this.extend(true, {}, obj[prop]);
            } else if ($.v.is.arr(obj[prop])) {
              target[prop] = this.extend(true, [], obj[prop]);
            }
          } else {
            target[prop] = obj[prop];
          }
        }
      }
      return target;
    },
    clone: function(obj) {
      if ($.v.is.arr(obj)) {
        return $.extend(true, [], obj);
      } else {
        return $.extend(true, {}, obj);
      }
    },
    dup: function(obj) {
      if ($.v.is.arr(obj)) {
        return $.extend(false, [], obj);
      } else {
        return $.extend(false, {}, obj);
      }
    },
    randomItem: function(arr) {
      return arr[this.randomInt(arr.length - 1)];
    },
    randomInt: function() {
      var args, max, min, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1) {
        _ref = [0, args[0]], min = _ref[0], max = _ref[1];
      } else {
        min = args[0], max = args[1];
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    capitalize: function(str) {
      return str[0].toUpperCase() + str.slice(1);
    },
    ensureArray: function(arr) {
      if (arr.length === 1 && $.is.arr(arr[0])) arr = arr[0];
      return arr;
    },
    arrayDelete: function(arr, item) {
      return arr.splice(item, 1);
    }
  });

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

  $.ender(enderMembers, true);

}).call(this);
