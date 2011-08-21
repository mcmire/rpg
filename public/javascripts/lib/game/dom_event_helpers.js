(function() {
  var game;
  var __slice = Array.prototype.slice;
  game = window.game;
  game.util.module("game.DOMEventHelpers", {
    bindEvents: function(elem, events) {
      var fn, name, namespacedEvents;
      namespacedEvents = {};
      for (name in events) {
        fn = events[name];
        namespacedEvents[name + "." + this.__name] = fn;
      }
      return $(elem).bind(namespacedEvents);
    },
    unbindEvents: function() {
      var args, elem, name, namespacedEventNames;
      elem = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      namespacedEventNames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          name = args[_i];
          _results.push(name + "." + this.__name);
        }
        return _results;
      }).call(this);
      return $(elem).unbind(namespacedEventNames.join(" "));
    }
  });
}).call(this);
