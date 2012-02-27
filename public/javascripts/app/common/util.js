(function() {
  var __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty;

  define('util', function() {
    return {
      extend: function() {
        var args, deep, obj, objects, prop, target, _i, _len;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (typeof args[0] === 'boolean') {
          deep = args.shift();
        } else {
          deep = false;
        }
        target = args.shift();
        objects = args;
        for (_i = 0, _len = objects.length; _i < _len; _i++) {
          obj = objects[_i];
          for (prop in obj) {
            if (!__hasProp.call(obj, prop)) continue;
            if (deep && ($.v.is.obj(obj[prop]) || $.v.is.arr(obj[prop]))) {
              target[prop] = this.clone(obj[prop]);
            } else {
              target[prop] = obj[prop];
            }
          }
        }
        return target;
      },
      clone: function(obj) {
        if ($.v.is.arr(obj)) {
          return this.extend(true, [], obj);
        } else if (this.isPlainObject(obj)) {
          return this.extend(true, {}, obj);
        } else {
          return obj;
        }
      },
      dup: function(obj) {
        if ($.v.is.arr(obj)) {
          return this.extend(false, [], obj);
        } else if (this.isPlainObject(obj)) {
          return this.extend(false, {}, obj);
        } else {
          return obj;
        }
      },
      isPlainObject: function(obj) {
        return $.v.is.obj(obj) && obj.constructor === Object;
      },
      createFromProto: function(obj) {
        return Object.create(obj);
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
    };
  });

}).call(this);
