(function() {
  var game, _chain, _ns;

  game = window.game;

  _ns = function(chainStrs) {
    var context, i, idStr, name;
    context = window;
    if (typeof chainStrs === "string") chainStrs = chainStrs.split(".");
    i = 0;
    while (i < chainStrs.length) {
      idStr = chainStrs[i];
      name = chainStrs.slice(0, i + 1).join(".");
      if (context[idStr] == null) {
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
    if (typeof chainStrs === "string") chainStrs = chainStrs.split(".");
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
      if (!str) return "";
      return str[0].toUpperCase() + str.slice(1);
    }
  });

}).call(this);
