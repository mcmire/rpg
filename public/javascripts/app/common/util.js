(function() {
  var __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty;

  define('util', function() {
    var arrayDelete, arrayInclude, capitalize, clone, cmp, createFromProto, dup, ensureArray, extend, hashWithout, isPlainObject, randomInt, randomItem;
    extend = function() {
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
            target[prop] = clone(obj[prop]);
          } else {
            target[prop] = obj[prop];
          }
        }
      }
      return target;
    };
    clone = function(obj) {
      if ($.v.is.arr(obj)) {
        return extend(true, [], obj);
      } else if (isPlainObject(obj)) {
        return extend(true, {}, obj);
      } else {
        return obj;
      }
    };
    dup = function(obj) {
      if ($.v.is.arr(obj)) {
        return extend(false, [], obj);
      } else if (isPlainObject(obj)) {
        return extend(false, {}, obj);
      } else {
        return obj;
      }
    };
    isPlainObject = function(obj) {
      return $.v.is.obj(obj) && obj.constructor === Object;
    };
    createFromProto = function(obj) {
      return Object.create(obj);
    };
    randomItem = function(arr) {
      return arr[randomInt(arr.length - 1)];
    };
    randomInt = function() {
      var args, max, min, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1) {
        _ref = [0, args[0]], min = _ref[0], max = _ref[1];
      } else {
        min = args[0], max = args[1];
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    capitalize = function(str) {
      return str[0].toUpperCase() + str.slice(1);
    };
    ensureArray = function(arr) {
      if (arr.length === 1 && $.is.arr(arr[0])) arr = arr[0];
      return arr;
    };
    arrayDelete = function(arr, item) {
      return arr.splice(item, 1);
    };
    arrayInclude = function(arr, item) {
      return arr.indexOf(item) !== -1;
    };
    cmp = function(a, b) {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    };
    hashWithout = function() {
      var hash, hash2, key, keys, _i, _len;
      hash = arguments[0], keys = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      hash2 = dup(hash);
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        delete hash2[key];
      }
      return hash2;
    };
    return {
      extend: extend,
      clone: clone,
      dup: dup,
      cmp: cmp,
      array: {
        "delete": arrayDelete,
        wrap: ensureArray,
        random: randomItem,
        include: arrayInclude
      },
      int: {
        random: randomInt
      },
      string: {
        capitalize: capitalize
      },
      is: {
        hash: isPlainObject
      },
      hash: {
        is: isPlainObject,
        without: hashWithout
      },
      isPlainObject: isPlainObject,
      randomItem: randomItem,
      randomInt: randomInt,
      capitalize: capitalize,
      ensureArray: ensureArray,
      arrayDelete: arrayDelete,
      createFromProto: createFromProto
    };
  });

}).call(this);
