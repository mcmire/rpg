var __slice = Array.prototype.slice;

define(function(require) {
  var ROLES, attachable, drawable, eventable, loadable, module, runnable, tickable, _getSafeNameFrom;
  module = require('app/meta').module;
  ROLES = ['eventable', 'attachable', 'tickable', 'drawable', 'loadable', 'runnable'];
  _getSafeNameFrom = function(obj) {
    var name;
    name = obj.__name__ || (obj.constructor && obj.constructor.__name__);
    return (name || "").replace(".", "_");
  };
  eventable = module('game.eventable', {
    addEvents: function() {
      throw new Error('must be overridden');
    },
    removeEvents: function() {
      throw new Error('must be overridden');
    },
    bindEvents: function(obj, events) {
      var fn, name, namespacedEvents, ns;
      ns = _getSafeNameFrom(obj);
      namespacedEvents = {};
      for (name in events) {
        fn = events[name];
        namespacedEvents[name + "." + ns] = fn;
      }
      return $(obj).bind(namespacedEvents);
    },
    unbindEvents: function() {
      var args, name, namespacedEventNames, ns, obj, _ref;
      obj = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      ns = _getSafeNameFrom(obj);
      namespacedEventNames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          name = args[_i];
          _results.push(name + "." + ns);
        }
        return _results;
      })();
      return (_ref = $(obj)).unbind.apply(_ref, namespacedEventNames);
    },
    triggerEvents: function() {
      var args, name, namespacedEventNames, ns, obj, _ref;
      obj = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      ns = _getSafeNameFrom(obj);
      namespacedEventNames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          name = args[_i];
          _results.push(name + "." + ns);
        }
        return _results;
      })();
      return (_ref = $(obj)).trigger.apply(_ref, namespacedEventNames);
    }
  });
  attachable = module('game.attachable', {
    attachTo: function(container) {
      return this.$element.appendTo(container);
    },
    detach: function(container) {
      return this.$element.detach();
    }
  });
  tickable = module('game.tickable', {
    tick: function() {
      throw new Error('must be overridden');
    }
  });
  drawable = module('game.drawable', tickable, {
    predraw: function() {
      throw new Error('must be overridden');
    },
    draw: function() {
      throw new Error('must be overridden');
    },
    postdraw: function() {
      throw new Error('must be overridden');
    }
  });
  loadable = module('game.loadable', {
    load: function() {
      throw new Error('must be overridden');
    },
    isLoaded: function() {
      throw new Error('must be overridden');
    }
  });
  runnable = module('game.runnable', {
    start: function() {
      throw new Error('must be overridden');
    },
    stop: function() {
      throw new Error('must be overridden');
    },
    suspend: function() {
      throw new Error('must be overridden');
    },
    resume: function() {
      throw new Error('must be overridden');
    }
  });
  return {
    ROLES: ROLES
  };
  return {
    eventable: eventable,
    attachable: attachable,
    drawable: drawable,
    loadable: loadable,
    runnable: runnable
  };
});
