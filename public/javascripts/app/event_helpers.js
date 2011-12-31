(function() {
  var game,
    __slice = Array.prototype.slice;

  game = window.game;

  game.util.module("game.EventHelpers", {
    bindEvents: function(obj, events) {
      var fn, name, namespacedEvents;
      namespacedEvents = {};
      for (name in events) {
        fn = events[name];
        namespacedEvents[name + "." + this.__name.replace(".", "_")] = fn;
      }
      return $(obj).bind(namespacedEvents);
    },
    unbindEvents: function() {
      var args, name, namespacedEventNames, obj, _ref;
      obj = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      namespacedEventNames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          name = args[_i];
          _results.push(name + "." + this.__name.replace(".", "_"));
        }
        return _results;
      }).call(this);
      return (_ref = $(obj)).unbind.apply(_ref, namespacedEventNames);
    },
    triggerEvents: function() {
      var args, name, namespacedEventNames, obj, _ref;
      obj = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      namespacedEventNames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          name = args[_i];
          _results.push(name + "." + this.__name.replace(".", "_"));
        }
        return _results;
      }).call(this);
      return (_ref = $(obj)).trigger.apply(_ref, namespacedEventNames);
    }
  });

}).call(this);
