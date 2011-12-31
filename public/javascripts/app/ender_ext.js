(function() {
  var __arSlice,
    __hasProp = Object.prototype.hasOwnProperty,
    __slice = Array.prototype.slice;

  __arSlice = Array.prototype.slice;

  $.ender({
    extend: function() {
      var args, deep, obj, objects, prop, target, _i, _len;
      args = __arSlice.call(arguments);
      deep = false;
      if (typeof args[0] === "boolean") deep = args.shift();
      target = args.shift();
      objects = args;
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        obj = objects[_i];
        for (prop in obj) {
          if (!__hasProp.call(obj, prop)) continue;
          if (typeof target[prop] === "function") {
            (function(_super, _new) {
              return target[prop] = function() {
                var rv, tmp;
                tmp = this._super;
                this._super = _super;
                rv = _new.apply(this, arguments);
                this._super = tmp;
                return rv;
              };
            })(target[prop], obj[prop]);
          } else if (deep && $.v.is.obj(obj[prop])) {
            target[prop] = this.extend(deep, {}, obj[prop]);
          } else {
            target[prop] = obj[prop];
          }
        }
      }
      return target;
    },
    clone: function(obj) {
      return $.extend({}, obj);
    },
    "export": function(chainStrs, newObj) {
      var chain, newIdStr, tail;
      if (typeof chainStrs === "string") chainStrs = chainStrs.split(".");
      newIdStr = chainStrs.pop();
      tail = this._ns(chainStrs);
      chain = this._chain(chainStrs);
      if (typeof newObj === "function") newObj = newObj.apply(newObj, chain);
      return tail[newIdStr] = newObj;
    },
    tap: function(obj, fn) {
      fn(obj);
      return obj;
    },
    randomItem: function(arr) {
      return this.randomInt(arr.length - 1);
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
    _ns: function(chainStrs) {
      var context, idStr, _i, _len;
      context = window;
      if (typeof chainStrs === "string") chainStrs = chainStrs.split(".");
      for (_i = 0, _len = chainStrs.length; _i < _len; _i++) {
        idStr = chainStrs[_i];
        if (context[idStr] == null) context[idStr] = {};
        context = context[idStr];
      }
      return context;
    },
    _chain: function(chainStrs) {
      var chain, idStr, obj, _i, _len;
      obj = window;
      if (typeof chainStrs === "string") chainStrs = chainStrs.split(".");
      chain = [];
      for (_i = 0, _len = chainStrs.length; _i < _len; _i++) {
        idStr = chainStrs[_i];
        obj = obj[idStr];
        chain.push(obj);
      }
      return chain;
    }
  });

  $.ender({
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
  }, true);

}).call(this);
