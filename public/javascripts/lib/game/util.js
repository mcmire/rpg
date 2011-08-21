(function() {
  var game, _chain, _module, _ns;
  var __slice = Array.prototype.slice;
  game = window.game;
  _module = function() {
    var args, chain, chainStrs, mixin, mixins, newIdStr, newObj, tail, _i, _len;
    chainStrs = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    newObj = {};
    mixins = [];
    switch (args.length) {
      case 2:
        mixins = args[0], newObj = args[1];
        break;
      case 1:
        newObj = args[0];
    }
    if (mixins) {
      if (!$.v.is.arr(mixins)) {
        mixins = [mixins];
      }
      for (_i = 0, _len = mixins.length; _i < _len; _i++) {
        mixin = mixins[_i];
        $.extend(newObj, mixin);
      }
    }
    if (typeof chainStrs === "string") {
      chainStrs = chainStrs.split(".");
    }
    newObj.__name = chainStrs.join(".");
    newIdStr = chainStrs.pop();
    tail = _ns(chainStrs);
    chain = _chain(chainStrs);
    if (typeof newObj === "function") {
      newObj = newObj.apply(newObj, chain);
    }
    tail[newIdStr] = newObj;
    return newObj;
  };
  _ns = function(chainStrs) {
    var context, i, idStr, name, _ref;
    context = window;
    if (typeof chainStrs === "string") {
      chainStrs = chainStrs.split(".");
    }
    i = 0;
    while (i < chainStrs.length) {
      idStr = chainStrs[i];
      name = chainStrs.slice(0, i + 1).join(".");
      if ((_ref = context[idStr]) == null) {
        context[idStr] = {
          __name: name
        };
      }
      context = context[idStr];
      i++;
    }
    return context;
  };
  _chain = function(chainStrs) {
    var chain, idStr, obj, _i, _len;
    obj = window;
    if (typeof chainStrs === "string") {
      chainStrs = chainStrs.split(".");
    }
    chain = [];
    for (_i = 0, _len = chainStrs.length; _i < _len; _i++) {
      idStr = chainStrs[_i];
      obj = obj[idStr];
      chain.push(obj);
    }
    return chain;
  };
  _module("game.util", {
    module: _module,
    randomFloat: function(min, max) {
      return Math.random() * (max - min) + min;
    },
    randomInt: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    capitalize: function(str) {
      if (!str) {
        return "";
      }
      return str[0].toUpperCase() + str.slice(1);
    }
  });
}).call(this);
